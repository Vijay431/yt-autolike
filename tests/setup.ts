import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';

type StorageAreaData = Record<string, unknown>;

function createStorageArea(initial: StorageAreaData = {}) {
  let data = { ...initial };

  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
      if (keys == null) return { ...data };
      if (typeof keys === 'string') return { [keys]: data[keys] };
      if (Array.isArray(keys)) {
        return Object.fromEntries(keys.map((key) => [key, data[key]]));
      }
      return Object.fromEntries(
        Object.entries(keys).map(([key, fallback]) => [key, data[key] ?? fallback]),
      );
    }),
    set: vi.fn(async (items: StorageAreaData) => {
      data = { ...data, ...items };
    }),
    clear: vi.fn(async () => {
      data = {};
    }),
    __getData: () => data,
    __setData: (next: StorageAreaData) => {
      data = { ...next };
    },
  };
}

export function resetChromeMock() {
  const local = createStorageArea();
  const sync = createStorageArea();
  const session = createStorageArea();

  vi.stubGlobal('chrome', {
    runtime: {
      id: 'test-extension-id',
      getURL: (path = '') => `chrome-extension://test-extension-id/${path}`,
      sendMessage: vi.fn(async () => undefined),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onInstalled: {
        addListener: vi.fn(),
      },
    },
    storage: {
      local,
      sync,
      session,
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(async () => undefined),
    },
  });
}

beforeEach(() => {
  resetChromeMock();
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});
