import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e.spec.ts', 'node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
