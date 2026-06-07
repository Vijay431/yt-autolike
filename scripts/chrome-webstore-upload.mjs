#!/usr/bin/env node
/* eslint-env node */

import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://chromewebstore.googleapis.com';
const REQUIRED_ENV = [
  'CHROME_PUBLISHER_ID',
  'CHROME_EXTENSION_ID',
  'CHROME_CLIENT_ID',
  'CHROME_CLIENT_SECRET',
  'CHROME_REFRESH_TOKEN',
];

export const parseArgs = (argv) => {
  const args = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--zip') {
      args.zip = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--zip=')) {
      args.zip = arg.slice('--zip='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
};

export const requireEnv = (env = process.env) => {
  const values = {};
  for (const name of REQUIRED_ENV) {
    const value = env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    values[name] = value;
  }
  return values;
};

export const resolveZip = (zip) => {
  if (!zip) {
    throw new Error('Missing required --zip path');
  }
  const zipPath = path.resolve(zip);
  if (!existsSync(zipPath)) {
    throw new Error(`Chrome ZIP not found: ${zipPath}`);
  }
  const stats = statSync(zipPath);
  if (!stats.isFile()) {
    throw new Error(`Chrome ZIP path is not a file: ${zipPath}`);
  }
  if (!zipPath.endsWith('.zip')) {
    throw new Error(`Chrome package must be a .zip file: ${zipPath}`);
  }
  return zipPath;
};

export const assertAcceptableUploadState = (response, label = 'upload') => {
  const state =
    response?.uploadState ??
    response?.lastAsyncUploadState ??
    response?.itemStatus?.uploadState ??
    response?.status?.uploadState;
  if (!state) {
    throw new Error(`${label} response did not include uploadState`);
  }
  if (/FAILED|FAILURE|INVALID|ERROR|NOT_FOUND|UNSPECIFIED/i.test(state)) {
    const details = response?.statusDetail ?? response?.itemStatus?.statusDetail ?? response?.error?.message;
    throw new Error(`${label} failed with uploadState ${state}${details ? `: ${details}` : ''}`);
  }
  return state;
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const bodyText = await response.text();
  let body = {};
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { raw: bodyText };
    }
  }
  if (!response.ok) {
    const message = body?.error_description ?? body?.error?.message ?? body?.raw ?? response.statusText;
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${message}`);
  }
  return body;
};

const getAccessToken = async ({ CHROME_CLIENT_ID, CHROME_CLIENT_SECRET, CHROME_REFRESH_TOKEN }) => {
  const body = new URLSearchParams({
    client_id: CHROME_CLIENT_ID,
    client_secret: CHROME_CLIENT_SECRET,
    refresh_token: CHROME_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  const response = await requestJson(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.access_token) {
    throw new Error('OAuth token response did not include access_token');
  }
  return response.access_token;
};

const uploadZip = async ({ accessToken, publisherId, extensionId, zipPath }) => {
  const name = `publishers/${publisherId}/items/${extensionId}`;
  const url = `${API_BASE}/upload/v2/${name}:upload`;
  return requestJson(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/zip',
    },
    body: createReadStream(zipPath),
    duplex: 'half',
  });
};

const fetchStatus = async ({ accessToken, publisherId, extensionId }) => {
  const name = `publishers/${publisherId}/items/${extensionId}`;
  const url = `${API_BASE}/v2/${name}:fetchStatus`;
  return requestJson(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const run = async ({ argv = process.argv.slice(2), env = process.env } = {}) => {
  const args = parseArgs(argv);
  const zipPath = resolveZip(args.zip);

  if (args.dryRun) {
    console.log(`Dry run: validated Chrome ZIP path ${zipPath}`);
    console.log('Dry run: skipped OAuth token exchange, upload, and status fetch');
    return;
  }

  const secrets = requireEnv(env);
  const accessToken = await getAccessToken(secrets);
  const uploadResponse = await uploadZip({
    accessToken,
    publisherId: secrets.CHROME_PUBLISHER_ID,
    extensionId: secrets.CHROME_EXTENSION_ID,
    zipPath,
  });
  const uploadState = assertAcceptableUploadState(uploadResponse, 'upload');
  console.log(`Chrome Web Store uploadState: ${uploadState}`);

  const statusResponse = await fetchStatus({
    accessToken,
    publisherId: secrets.CHROME_PUBLISHER_ID,
    extensionId: secrets.CHROME_EXTENSION_ID,
  });
  const statusState = assertAcceptableUploadState(statusResponse, 'fetchStatus');
  console.log(`Chrome Web Store fetchStatus uploadState: ${statusState}`);
  console.log(JSON.stringify(statusResponse, null, 2));
};

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
