/**
 * Typed wrappers around chrome.storage for the YT AutoLike extension.
 * Settings and whitelist are synced; stats and logs are device-local.
 */

import type { Settings, Whitelist, Stats, LogEntry, WhitelistEntry } from './types';
import { DEFAULT_PERCENTAGE, MAX_LOGS } from './constants';
import { isValidLogEntry } from './messages';

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: Settings = {
  mode: 'global',
  target_percentage: DEFAULT_PERCENTAGE,
  hourly_reminders_enabled: true,
};

export const DEFAULT_WHITELIST: Whitelist = { channels: [] };

export const DEFAULT_STATS: Stats = {
  total_likes_performed: 0,
  accumulated_watch_seconds: 0,
};

// ---------------------------------------------------------------------------
// Validation Helpers (Ensures type safety and prevents storage corruption)
// ---------------------------------------------------------------------------

function validateSettings(val: unknown): Settings {
  if (!val || typeof val !== 'object') return DEFAULT_SETTINGS;
  const s = val as Record<string, unknown>;

  const mode =
    s.mode === 'global' ||
    s.mode === 'only_shorts' ||
    s.mode === 'only_videos' ||
    s.mode === 'whitelist_only'
      ? s.mode
      : DEFAULT_SETTINGS.mode;

  const target_percentage =
    typeof s.target_percentage === 'number' &&
    s.target_percentage >= 0.1 &&
    s.target_percentage <= 0.9
      ? s.target_percentage
      : DEFAULT_SETTINGS.target_percentage;

  const hourly_reminders_enabled =
    typeof s.hourly_reminders_enabled === 'boolean'
      ? s.hourly_reminders_enabled
      : DEFAULT_SETTINGS.hourly_reminders_enabled;

  return { mode, target_percentage, hourly_reminders_enabled };
}

function validateWhitelist(val: unknown): Whitelist {
  if (!val || typeof val !== 'object') return DEFAULT_WHITELIST;
  const w = val as Record<string, unknown>;
  if (!Array.isArray(w.channels)) return DEFAULT_WHITELIST;

  const validChannels = w.channels.filter((c: unknown): c is WhitelistEntry => {
    if (!c || typeof c !== 'object') return false;
    const channel = c as Record<string, unknown>;
    return (
      typeof channel.id === 'string' &&
      typeof channel.name === 'string' &&
      typeof channel.added_at === 'number'
    );
  });

  return { channels: validChannels };
}

function validateStats(val: unknown): Stats {
  if (!val || typeof val !== 'object') return DEFAULT_STATS;
  const s = val as Record<string, unknown>;

  const total_likes_performed =
    typeof s.total_likes_performed === 'number'
      ? s.total_likes_performed
      : DEFAULT_STATS.total_likes_performed;

  const accumulated_watch_seconds =
    typeof s.accumulated_watch_seconds === 'number'
      ? s.accumulated_watch_seconds
      : DEFAULT_STATS.accumulated_watch_seconds;

  return { total_likes_performed, accumulated_watch_seconds };
}

// ---------------------------------------------------------------------------
// Settings (Stored in sync storage)
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get('settings');
  return validateSettings(result.settings);
}

export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings: validateSettings(settings) });
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...patch };
  await setSettings(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Whitelist (Stored in sync storage)
// ---------------------------------------------------------------------------

export async function getWhitelist(): Promise<Whitelist> {
  const result = await chrome.storage.sync.get('whitelist');
  return validateWhitelist(result.whitelist);
}

export async function setWhitelist(whitelist: Whitelist): Promise<void> {
  await chrome.storage.sync.set({ whitelist: validateWhitelist(whitelist) });
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getStats(): Promise<Stats> {
  const result = await chrome.storage.local.get('stats');
  return validateStats(result.stats);
}

export async function setStats(stats: Stats): Promise<void> {
  await chrome.storage.local.set({ stats: validateStats(stats) });
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

export async function getLogs(): Promise<LogEntry[]> {
  const result = await chrome.storage.local.get('logs');
  if (!Array.isArray(result.logs)) return [];
  return result.logs.filter(isValidLogEntry);
}

export async function appendLog(entry: LogEntry): Promise<void> {
  if (!isValidLogEntry(entry)) return;
  const logs = await getLogs();
  const updated = [entry, ...logs].slice(0, MAX_LOGS);
  await chrome.storage.local.set({ logs: updated });
}
