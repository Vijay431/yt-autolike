import { describe, expect, test } from 'vitest';
import {
  appendLog,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_WHITELIST,
  getLogs,
  getSettings,
  getStats,
  getWhitelist,
} from '../src/lib/storage';
import { MAX_LOGS } from '../src/lib/constants';
import type { LogEntry } from '../src/lib/types';

describe('storage boundaries and validation', () => {
  test('falls back to default settings when persisted settings are malformed', async () => {
    await chrome.storage.sync.set({ settings: { mode: 'chaos', target_percentage: 5 } });

    await expect(getSettings()).resolves.toEqual(DEFAULT_SETTINGS);
    expect(chrome.storage.local.get).not.toHaveBeenCalledWith('settings');
  });

  test('keeps settings and whitelist in sync storage while stats and logs stay local', async () => {
    await chrome.storage.sync.set({
      whitelist: {
        channels: [
          { id: 'UC123', name: 'Good Channel', added_at: 1 },
          { id: 123, name: 'Bad Channel', added_at: 2 },
        ],
      },
    });
    await chrome.storage.local.set({ stats: { total_likes_performed: 'nope' } });

    await expect(getWhitelist()).resolves.toEqual({
      channels: [{ id: 'UC123', name: 'Good Channel', added_at: 1 }],
    });
    await expect(getStats()).resolves.toEqual(DEFAULT_STATS);
    expect(chrome.storage.sync.get).toHaveBeenCalledWith('whitelist');
    expect(chrome.storage.local.get).toHaveBeenCalledWith('stats');
  });

  test('returns empty whitelist defaults for invalid whitelist payloads', async () => {
    await chrome.storage.sync.set({ whitelist: { channels: 'not-array' } });

    await expect(getWhitelist()).resolves.toEqual(DEFAULT_WHITELIST);
  });

  test('caps logs at MAX_LOGS and filters malformed entries', async () => {
    const entry = (timestamp: number): LogEntry => ({
      timestamp,
      title: `Video ${timestamp}`,
      channel: 'Creator',
      type: 'video',
      status: 'liked',
    });

    await chrome.storage.local.set({ logs: [{ nope: true }, entry(0)] });
    for (let index = 1; index <= MAX_LOGS + 5; index += 1) {
      await appendLog(entry(index));
    }

    const logs = await getLogs();
    expect(logs).toHaveLength(MAX_LOGS);
    expect(logs[0]?.timestamp).toBe(MAX_LOGS + 5);
    expect(logs.at(-1)?.timestamp).toBe(6);
  });
});
