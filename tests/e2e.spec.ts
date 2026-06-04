import { test, expect, chromium } from '@playwright/test';
import type { BrowserContext, Page, Worker } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.join(__dirname, '../dist/chrome');
const popupPathCandidates = ['popup/index.html', 'action/index.html', 'popup.html'];
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
let userDataDir = '';

async function getExtensionId(browserContext: BrowserContext): Promise<string> {
  const background = browserContext.serviceWorkers()[0] ?? browserContext.backgroundPages()[0];
  if (!background) return getExtensionIdFromPreferences() ?? getUnpackedExtensionId(extensionPath);

  return (
    (background as Worker | Page).url().split('/')[2] ??
    getExtensionIdFromPreferences() ??
    getUnpackedExtensionId(extensionPath)
  );
}

function getExtensionIdFromPreferences(): string | null {
  const preferencesPath = path.join(userDataDir, 'Default', 'Preferences');
  if (!fs.existsSync(preferencesPath)) return null;

  const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8')) as {
    extensions?: {
      settings?: Record<string, { path?: string; state?: number }>;
    };
  };
  const settings = preferences.extensions?.settings ?? {};
  const match = Object.entries(settings).find(([, extension]) => {
    if (extension.state !== 1 || !extension.path) return false;
    return path.resolve(extension.path) === path.resolve(extensionPath);
  });
  return match?.[0] ?? null;
}

function getUnpackedExtensionId(unpackedPath: string): string {
  const hash = crypto.createHash('sha256').update(path.resolve(unpackedPath)).digest('hex');
  return hash
    .slice(0, 32)
    .split('')
    .map((char) => String.fromCharCode('a'.charCodeAt(0) + Number.parseInt(char, 16)))
    .join('');
}

async function openFirstExistingExtensionPage(
  page: Page,
  extensionId: string,
  paths: string[],
): Promise<void> {
  for (const candidate of paths) {
    const response = await page.goto(`chrome-extension://${extensionId}/${candidate}`);
    if (response?.ok()) return;
  }

  throw new Error(`None of these extension pages loaded: ${paths.join(', ')}`);
}

test.describe('YT AutoLike Extension E2E', () => {
  let browserContext: BrowserContext;

  test.beforeAll(async () => {
    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-autolike-e2e-'));
    // Extensions require a persistent Chromium profile. Chromium's extension
    // mode is headed on local runs; CI uses xvfb through Playwright when needed.
    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      executablePath: chromiumExecutablePath,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
  });

  test.afterAll(async () => {
    if (browserContext) {
      await browserContext.close();
    }
    if (userDataDir) fs.rmSync(userDataDir, { recursive: true, force: true });
  });

  test('popup renders correctly and performance is acceptable', async () => {
    const page = await browserContext.newPage();

    const extensionId = await getExtensionId(browserContext);
    await openFirstExistingExtensionPage(page, extensionId, popupPathCandidates);

    // Verify popup loads and check main elements
    await expect(page.locator('text=YT AutoLike')).toBeVisible();
    await expect(page.locator('text=Targeting Mode')).toBeVisible();

    // The extension is fully local and should be fast
    const perf = await page.evaluate(
      () =>
        (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventEnd,
    );
    expect(perf).toBeLessThan(1000); // Popup should load in < 1s (Back/Forward Cache compatible)
  });
});
