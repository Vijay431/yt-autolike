import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import {
  assertAcceptableUploadState,
  parseArgs,
  requireEnv,
  resolveZip,
} from '../tools/chrome-webstore-upload.mjs';

describe('Chrome Web Store upload helper', () => {
  test('requires named secrets for real uploads', () => {
    const env = { CHROME_PUBLISHER_ID: 'publisher' } as unknown as NodeJS.ProcessEnv;

    expect(() => requireEnv(env)).toThrow(
      'Missing required environment variable: CHROME_EXTENSION_ID',
    );
  });

  test('fails missing ZIP before API work', () => {
    expect(() => resolveZip('/tmp/yt-autolike-missing.zip')).toThrow('Chrome ZIP not found');
  });

  test('accepts an existing ZIP path', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'yt-autolike-'));
    const zipPath = path.join(dir, 'yt-autolike-v1.0.0-chrome.zip');
    writeFileSync(zipPath, 'zip');

    expect(resolveZip(zipPath)).toBe(zipPath);
  });

  test('parses dry-run upload arguments', () => {
    expect(parseArgs(['--zip', 'dist/zips/package.zip', '--dry-run'])).toEqual({
      zip: 'dist/zips/package.zip',
      dryRun: true,
    });
  });

  test('fails invalid upload states', () => {
    expect(() =>
      assertAcceptableUploadState({
        uploadState: 'UPLOAD_FAILED',
        statusDetail: 'Invalid package',
      }),
    ).toThrow('upload failed with uploadState UPLOAD_FAILED: Invalid package');
  });

  test('accepts in-progress and complete upload states', () => {
    expect(assertAcceptableUploadState({ uploadState: 'IN_PROGRESS' })).toBe('IN_PROGRESS');
    expect(assertAcceptableUploadState({ lastAsyncUploadState: 'SUCCEEDED' })).toBe('SUCCEEDED');
  });
});
