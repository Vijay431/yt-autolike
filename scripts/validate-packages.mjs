import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'dist', 'zips');
const version = process.env.npm_package_version;
const packagePrefix = `yt-autolike-v${version}`;
const runtimeDocs = new Set([
  'README.md',
  'DEVELOPER.md',
  'CHROMEWEBSTORE.md',
  'FIREFOX_AMO.md',
  'PRIVACY_POLICY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'AGENTS.md',
  'GEMINI.md',
]);
const runtimeForbidden = [
  /^src\//,
  /^tests?\//,
  /^node_modules\//,
  /^dist\//,
  /^docs?\//,
  /^\.git\//,
  /^\.agent\//,
  /^\.agents\//,
  /^\.antigravitycli\//,
  /^\.claude\//,
  /^\.codegraph\//,
  /^\.codex\//,
  /^\.gemini\//,
  /^graphify-out\//,
  /^test-results\//,
  /(^|\/).*\.map$/,
  /^screenshot\.png$/,
  /(^|\/).*\.tsx?$/,
];
const sourceForbidden = [
  /^dist\//,
  /^node_modules\//,
  /^coverage\//,
  /^playwright-report\//,
  /^test-results\//,
  /^graphify-out\//,
  /^\.agent\//,
  /^\.agents\//,
  /^\.antigravitycli\//,
  /^\.claude\//,
  /^\.codegraph\//,
  /^\.codex\//,
  /^\.gemini\//,
];

const fail = (message) => {
  throw new Error(message);
};

const zipList = (zipPath) =>
  execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

const zipText = (zipPath, entry) => execFileSync('unzip', ['-p', zipPath, entry], { encoding: 'utf8' });

const requireEntry = (zipName, entries, entry) => {
  if (!entries.includes(entry)) {
    fail(`${zipName} is missing ${entry}`);
  }
};

const collectManifestRefs = (manifest) => {
  const refs = new Set();
  const add = (value) => {
    if (typeof value === 'string' && value.length > 0) refs.add(value);
  };
  const addIcons = (icons) => {
    if (!icons) return;
    for (const value of Object.values(icons)) add(value);
  };

  addIcons(manifest.icons);
  add(manifest.action?.default_popup);
  addIcons(manifest.action?.default_icon);
  add(manifest.options_ui?.page);
  add(manifest.background?.service_worker);
  for (const script of manifest.background?.scripts ?? []) add(script);
  for (const contentScript of manifest.content_scripts ?? []) {
    for (const js of contentScript.js ?? []) add(js);
    for (const css of contentScript.css ?? []) add(css);
  }

  return refs;
};

const validateNoRemoteReferences = (zipPath, zipName, entries) => {
  const textFilePattern = /\.(css|html|js|json|txt|svg)$/;
  for (const entry of entries) {
    if (entry.endsWith('/') || !textFilePattern.test(entry)) continue;
    const text = zipText(zipPath, entry);
    const remoteMatches = text.match(/https?:\/\/[^\s"'`<>)]+/gi) ?? [];
    const actionableRemoteMatches = remoteMatches.filter(
      (url) =>
        !url.startsWith('http://www.w3.org/') &&
        !url.startsWith('http://www.w3.org/1998/') &&
        !url.startsWith('http://www.w3.org/1999/') &&
        !url.startsWith('http://www.w3.org/2000/') &&
        !url.startsWith('https://reactjs.org/docs/error-decoder.html') &&
        !url.startsWith('https://react.dev/errors/'),
    );
    if (actionableRemoteMatches.length > 0) {
      fail(`${zipName} contains a remote http(s) reference in ${entry}`);
    }
  }
};

const validateRuntimePackage = (zipPath, browser) => {
  const zipName = path.basename(zipPath);
  const entries = zipList(zipPath);
  const entrySet = new Set(entries);

  requireEntry(zipName, entries, 'manifest.json');
  if (entries.some((entry) => entry.startsWith(`${path.basename(zipPath, path.extname(zipPath))}/`))) {
    fail(`${zipName} appears to contain a top-level wrapper folder`);
  }

  for (const entry of entries) {
    const topLevelName = entry.split('/')[0];
    if (runtimeDocs.has(entry) || runtimeDocs.has(topLevelName)) {
      fail(`${zipName} contains source/review doc ${entry}`);
    }
    if (runtimeForbidden.some((pattern) => pattern.test(entry))) {
      fail(`${zipName} contains forbidden runtime file ${entry}`);
    }
  }

  const manifest = JSON.parse(zipText(zipPath, 'manifest.json'));
  if (manifest.version !== version) {
    fail(`${zipName} manifest version ${manifest.version} does not match package version ${version}`);
  }

  for (const ref of collectManifestRefs(manifest)) {
    if (!entrySet.has(ref)) {
      fail(`${zipName} manifest references missing file ${ref}`);
    }
  }

  if (browser === 'firefox') {
    if (!Array.isArray(manifest.background?.scripts) || manifest.background.scripts.length === 0) {
      fail(`${zipName} must use background.scripts for Firefox`);
    }
    if (manifest.background.service_worker) {
      fail(`${zipName} must not use background.service_worker for Firefox`);
    }
    if (!manifest.browser_specific_settings?.gecko?.id) {
      fail(`${zipName} is missing browser_specific_settings.gecko.id`);
    }
    const required = manifest.data_collection_permissions?.required;
    if (!Array.isArray(required) || required.length !== 1 || required[0] !== 'none') {
      fail(`${zipName} must declare data_collection_permissions.required: ["none"]`);
    }
  } else {
    if (!manifest.background?.service_worker) {
      fail(`${zipName} must use background.service_worker for Chromium-family browsers`);
    }
    if (manifest.background.scripts) {
      fail(`${zipName} must not use background.scripts for Chromium-family browsers`);
    }
  }

  validateNoRemoteReferences(zipPath, zipName, entries);
  console.log(`Validated ${zipName}`);
};

const validateSourcePackage = (zipPath) => {
  const zipName = path.basename(zipPath);
  const entries = zipList(zipPath);
  for (const entry of entries) {
    if (sourceForbidden.some((pattern) => pattern.test(entry))) {
      fail(`${zipName} contains generated/cache file ${entry}`);
    }
  }
  for (const required of ['package.json', 'pnpm-lock.yaml', 'src/manifest.json', 'README.md', 'FIREFOX_AMO.md']) {
    requireEntry(zipName, entries, required);
  }
  console.log(`Validated ${zipName}`);
};

if (!version) {
  fail('npm_package_version is not available; run with pnpm/npm scripts.');
}
if (!existsSync(outDir)) {
  fail(`Package directory not found: ${outDir}`);
}

const expectedRuntime = ['chrome', 'chromium', 'edge', 'firefox'];
for (const browser of expectedRuntime) {
  validateRuntimePackage(path.join(outDir, `${packagePrefix}-${browser}.zip`), browser);
}
validateRuntimePackage(path.join(outDir, `${packagePrefix}-firefox.xpi`), 'firefox');
validateSourcePackage(path.join(outDir, `${packagePrefix}-source.zip`));

const expectedNames = new Set([
  ...expectedRuntime.map((browser) => `${packagePrefix}-${browser}.zip`),
  `${packagePrefix}-firefox.xpi`,
  `${packagePrefix}-source.zip`,
]);
for (const fileName of readdirSync(outDir)) {
  if ((fileName.endsWith('.zip') || fileName.endsWith('.xpi')) && !expectedNames.has(fileName)) {
    fail(`Unexpected package artifact found: ${fileName}`);
  }
}
