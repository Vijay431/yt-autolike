import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

type TranslationValue = string | TranslationTree;
interface TranslationTree {
  [key: string]: TranslationValue;
}
type I18nResources = Record<string, { translation: TranslationTree }>;

const repoRoot = join(import.meta.dirname, '..');
const indexPath = join(repoRoot, 'docs', 'index.html');
const i18nPath = join(repoRoot, 'docs', 'i18n.js');

const getNestedValue = (tree: TranslationTree, key: string): string | undefined =>
  key.split('.').reduce<TranslationValue | undefined>((current, part) => {
    if (!current || typeof current === 'string') {
      return undefined;
    }

    return current[part];
  }, tree) as string | undefined;

const collectLeafKeys = (tree: TranslationTree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      return [nextKey];
    }

    return collectLeafKeys(value, nextKey);
  });

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

const loadDocsPage = async () => {
  document.documentElement.lang = 'en';
  document.body.innerHTML =
    readFileSync(indexPath, 'utf8').match(/<body>([\s\S]*)<\/body>/)?.[1] ?? '';
  localStorage.clear();

  let activeLanguage = 'en';
  const context = {
    document,
    localStorage,
    window: window as Window & {
      YTAutoLikeI18n?: {
        fallbackLanguage: string;
        resources: I18nResources;
      };
    },
    i18next: {
      language: activeLanguage,
      init: async ({ lng }: { lng: string }) => {
        activeLanguage = lng;
        context.i18next.language = lng;
      },
      changeLanguage: async (language: string) => {
        activeLanguage = language;
        context.i18next.language = language;
      },
      t: (key: string) => {
        const resources = context.window.YTAutoLikeI18n?.resources ?? {};
        return getNestedValue(resources[activeLanguage]?.translation ?? {}, key) ?? key;
      },
    },
  };

  vm.runInNewContext(readFileSync(i18nPath, 'utf8'), context, {
    filename: i18nPath,
  });
  await flushPromises();

  return context;
};

describe('docs i18n', () => {
  it('lists the supported languages in the requested order', async () => {
    await loadDocsPage();

    const options = Array.from(
      document.querySelectorAll<HTMLSelectElement>('#language-select option'),
    ).map((option) => [option.value, option.textContent]);

    expect(options).toEqual([
      ['en', 'English (Global)'],
      ['en-US', 'English (US)'],
      ['en-GB', 'English (UK)'],
      ['ta', 'Tamil'],
      ['te', 'Telugu'],
      ['kn', 'Kannada'],
      ['ml', 'Malayalam'],
      ['hi', 'Hindi'],
      ['zh-CN', 'Chinese (Simplified)'],
    ]);
  });

  it('keeps every locale aligned with the fallback translation keys', async () => {
    const context = await loadDocsPage();
    const resources = context.window.YTAutoLikeI18n?.resources ?? {};
    const fallbackKeys = collectLeafKeys(resources.en.translation).sort();

    expect(Object.keys(resources).sort()).toEqual([
      'en',
      'en-GB',
      'en-US',
      'hi',
      'kn',
      'ml',
      'ta',
      'te',
      'zh-CN',
    ]);

    Object.entries(resources).forEach(([language, resource]) => {
      expect(collectLeafKeys(resource.translation).sort(), language).toEqual(fallbackKeys);
    });
  });

  it('updates page copy, html lang, and storage when the language changes', async () => {
    await loadDocsPage();

    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    languageSelect.value = 'ta';
    languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();

    expect(document.documentElement.lang).toBe('ta');
    expect(localStorage.getItem('yt-autolike-language')).toBe('ta');
    expect(document.querySelector('[data-i18n-html="hero.title"]')?.textContent).toContain(
      'படைப்பாளர்களை',
    );

    languageSelect.value = 'zh-CN';
    languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();

    expect(document.documentElement.lang).toBe('zh-CN');
    expect(localStorage.getItem('yt-autolike-language')).toBe('zh-CN');
    expect(document.querySelector('[data-i18n="nav.features"]')?.textContent).toBe('功能');
  });

  it('keeps the dropdown accessible as a native labeled select', async () => {
    await loadDocsPage();

    const languageSelect = document.getElementById('language-select');

    expect(languageSelect?.tagName).toBe('SELECT');
    expect(languageSelect).toHaveAttribute('aria-label', 'Language');
  });
});
