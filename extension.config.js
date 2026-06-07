import fs from 'node:fs';

/** @type {import('extension').FileConfig} */
// Extension.js uses a fresh profile on every run.
// Prefer that default? Remove the profile config below.
const profile = (name) => `./dist/extension-profile-${name}`;
const ciFlags = process.env.CI ? ['--no-sandbox', '--disable-gpu'] : [];

// On Linux, the google-chrome wrapper script redirects stdin/stdout to /dev/null,
// which breaks the --remote-debugging-pipe required by Extension.js dev runner.
// We resolve the direct binary path to bypass the wrapper script.
const getChromiumBinary = () => {
  if (process.platform === 'linux') {
    if (fs.existsSync('/opt/google/chrome/chrome')) {
      return '/opt/google/chrome/chrome';
    }
  }
  return undefined;
};

const chromiumBinary = getChromiumBinary();
const releaseHelperEntries = new Set([
  'scripts/package-extension.sh',
  'scripts/validate-packages.mjs',
  'scripts/chrome-webstore-upload.mjs',
]);

class IgnoreReleaseHelperEntriesPlugin {
  apply(compiler) {
    const removeReleaseHelpers = () => {
      for (const entryName of Object.keys(compiler.options.entry ?? {})) {
        if (entryName.startsWith('scripts/') || releaseHelperEntries.has(entryName)) {
          delete compiler.options.entry[entryName];
        }
      }
    };

    removeReleaseHelpers();
    compiler.hooks.afterPlugins?.tap('IgnoreReleaseHelperEntriesPlugin', removeReleaseHelpers);
    compiler.hooks.environment?.tap('IgnoreReleaseHelperEntriesPlugin', removeReleaseHelpers);
  }
}

export default {
  config(config) {
    config.plugins = [...(config.plugins ?? []), new IgnoreReleaseHelperEntriesPlugin()];
    return config;
  },
  browser: {
    chrome: {
      profile: profile('chrome'),
      browserFlags: ciFlags,
      ...(chromiumBinary ? { chromiumBinary } : {}),
    },
    chromium: {
      profile: profile('chromium'),
      browserFlags: ciFlags,
      ...(chromiumBinary ? { chromiumBinary } : {}),
    },
    edge: { profile: profile('edge'), browserFlags: ciFlags },
    firefox: { profile: profile('firefox') },
    'chromium-based': {
      profile: profile('chromium-based'),
      browserFlags: ciFlags,
      ...(chromiumBinary ? { chromiumBinary } : {}),
    },
    'gecko-based': { profile: profile('gecko-based') },
  },
};
