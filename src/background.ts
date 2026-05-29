/**
 * Background Service Worker — YT AutoLike
 *
 * Responsibilities:
 *  1. Receive HEARTBEAT pings from content scripts and accumulate watch time.
 *     When 900 s (15 min) is reached, emit SHOW_REMINDER back to the active YouTube tab.
 *  2. Handle RECORD_LIKE / RECORD_SKIP messages — write to storage so the popup
 *     can read an up-to-date activity feed without race conditions.
 *  3. Track popup open/closed state in chrome.storage.session so content scripts
 *     can query it when deciding whether to proceed with an "active-watching" check.
 *
 * IMPORTANT: Service workers are ephemeral (~30 s idle before termination).
 * All state is persisted in chrome.storage.local or chrome.storage.session — never
 * in module-level variables.
 */

import {appendLog, getStats, setStats} from './lib/storage'
import {WATCH_SECONDS_PER_REMINDER, HEARTBEAT_INTERVAL_MS} from './lib/constants'
import type {LogEntry} from './lib/types'

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async () => {
    if (!message?.type) return

    switch (message.type) {
      // -----------------------------------------------------------------------
      // Content script heartbeat — called every HEARTBEAT_INTERVAL_MS while
      // the user is actively watching (tab visible + video playing).
      // -----------------------------------------------------------------------
      case 'HEARTBEAT': {
        const stats = await getStats()
        const secondsToAdd = HEARTBEAT_INTERVAL_MS / 1000
        const newAccumulated = stats.accumulated_watch_seconds + secondsToAdd

        if (newAccumulated >= WATCH_SECONDS_PER_REMINDER) {
          // Reset counter and instruct the content script to show the reminder.
          await setStats({...stats, accumulated_watch_seconds: 0})
          // Reply so the content script can handle the reminder synchronously.
          sendResponse({type: 'SHOW_REMINDER'})
        } else {
          await setStats({...stats, accumulated_watch_seconds: newAccumulated})
          sendResponse({type: 'HEARTBEAT_ACK'})
        }
        break
      }

      // -----------------------------------------------------------------------
      // Content script reports a successful auto-like.
      // -----------------------------------------------------------------------
      case 'RECORD_LIKE': {
        const entry: LogEntry = message.entry
        const stats = await getStats()
        await setStats({...stats, total_likes_performed: stats.total_likes_performed + 1})
        await appendLog(entry)
        sendResponse({ok: true})
        break
      }

      // -----------------------------------------------------------------------
      // Content script reports a skipped like.
      // -----------------------------------------------------------------------
      case 'RECORD_SKIP': {
        const entry: LogEntry = message.entry
        await appendLog(entry)
        sendResponse({ok: true})
        break
      }

      // -----------------------------------------------------------------------
      // Popup notifies background it is open.
      // -----------------------------------------------------------------------
      case 'POPUP_OPENED': {
        await chrome.storage.session.set({popupOpen: true})
        sendResponse({ok: true})
        break
      }

      // -----------------------------------------------------------------------
      // Popup notifies background it is closing.
      // -----------------------------------------------------------------------
      case 'POPUP_CLOSED': {
        await chrome.storage.session.set({popupOpen: false})
        sendResponse({ok: true})
        break
      }

      // -----------------------------------------------------------------------
      // Content script asks whether the popup is currently open.
      // -----------------------------------------------------------------------
      case 'IS_POPUP_OPEN': {
        const session = await chrome.storage.session.get('popupOpen')
        sendResponse({type: 'IS_POPUP_OPEN_RESPONSE', open: !!session.popupOpen})
        break
      }

      default:
        break
    }
  })()

  // Return true to keep the message channel open for async sendResponse.
  return true
})

// ---------------------------------------------------------------------------
// On install / update: initialise storage defaults if missing.
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['settings', 'whitelist', 'stats', 'logs'])

  const defaults: Record<string, unknown> = {}
  if (!existing.settings) {
    defaults.settings = {
      mode: 'global',
      target_percentage: 0.5,
      hourly_reminders_enabled: true,
      is_paused: false,
    }
  }
  if (!existing.whitelist) defaults.whitelist = {channels: []}
  if (!existing.stats) defaults.stats = {total_likes_performed: 0, accumulated_watch_seconds: 0}
  if (!existing.logs) defaults.logs = []

  if (Object.keys(defaults).length > 0) {
    await chrome.storage.local.set(defaults)
  }
})
