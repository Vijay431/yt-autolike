import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'graphify-out/',
      'openspec/',
      '.claude/',
      'extension-env.d.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['docs/**/*.js'],
    languageOptions: { globals: { i18next: 'readonly' } },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
  },
  { files: ['**/*.{ts,tsx}'], ...react.configs.flat['jsx-runtime'] },
  { files: ['**/*.{ts,tsx}'], ...reactHooks.configs.flat['recommended-latest'] },
  prettier,
);
