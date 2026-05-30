/**
 * Typed wrappers around chrome.storage.local for the YT AutoLike extension.
 * All defaults match the schema in the TRD.
 */

import type {Settings, Whitelist, Stats, LogEntry} from './types'
import {DEFAULT_PERCENTAGE, MAX_LOGS} from './constants'

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: Settings = {
  mode: 'global',
  target_percentage: DEFAULT_PERCENTAGE,
  hourly_reminders_enabled: true,
  is_paused: false,
}

export const DEFAULT_WHITELIST: Whitelist = {channels: []}

export const DEFAULT_STATS: Stats = {
  total_likes_performed: 0,
  accumulated_watch_seconds: 0,
}

// ---------------------------------------------------------------------------
// Settings (Stored in sync storage)
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get('settings')
  return result.settings ? {...DEFAULT_SETTINGS, ...result.settings} : DEFAULT_SETTINGS
}

export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({settings})
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const updated = {...current, ...patch}
  await setSettings(updated)
  return updated
}

// ---------------------------------------------------------------------------
// Whitelist (Stored in sync storage)
// ---------------------------------------------------------------------------

export async function getWhitelist(): Promise<Whitelist> {
  const result = await chrome.storage.sync.get('whitelist')
  return result.whitelist ?? DEFAULT_WHITELIST
}

export async function setWhitelist(whitelist: Whitelist): Promise<void> {
  await chrome.storage.sync.set({whitelist})
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getStats(): Promise<Stats> {
  const result = await chrome.storage.local.get('stats')
  return result.stats ? {...DEFAULT_STATS, ...result.stats} : DEFAULT_STATS
}

export async function setStats(stats: Stats): Promise<void> {
  await chrome.storage.local.set({stats})
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

export async function getLogs(): Promise<LogEntry[]> {
  const result = await chrome.storage.local.get('logs')
  return result.logs ?? []
}

export async function appendLog(entry: LogEntry): Promise<void> {
  const logs = await getLogs()
  const updated = [entry, ...logs].slice(0, MAX_LOGS)
  await chrome.storage.local.set({logs: updated})
}
