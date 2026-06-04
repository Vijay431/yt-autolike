import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.join(__dirname, '../dist/chrome');

test.describe('YT AutoLike Extension E2E', () => {
  let browserContext;

  test.beforeAll(async () => {
    // Launch Chrome with the extension loaded
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
  });

  test.afterAll(async () => {
    if (browserContext) {
      await browserContext.close();
    }
  });

  test('popup renders correctly and performance is acceptable', async () => {
    const page = await browserContext.newPage();

    // We navigate to a placeholder to ensure the browser context is ready
    await page.goto('https://www.google.com');

    // Find the extension ID from the background pages
    let [background] = browserContext.backgroundPages();
    if (!background) {
      background = browserContext.serviceWorkers()[0];
    }

    const extensionId = background.url().split('/')[2];

    // Navigate to the popup
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Verify popup loads and check main elements
    await expect(page.locator('text=YT AutoLike')).toBeVisible();
    await expect(page.locator('text=Targeting Mode')).toBeVisible();

    // The extension is fully local and should be fast
    const perf = await page.evaluate(
      () => performance.getEntriesByType('navigation')[0].loadEventEnd,
    );
    expect(perf).toBeLessThan(1000); // Popup should load in < 1s (Back/Forward Cache compatible)
  });
});
