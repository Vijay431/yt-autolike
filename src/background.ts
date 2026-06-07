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
 * Settings/whitelist live in chrome.storage.sync, stats/logs in
 * chrome.storage.local, popup state in chrome.storage.session.
 */

import {
  appendLog,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_WHITELIST,
  getStats,
  setStats,
} from './lib/storage';
import { WATCH_SECONDS_PER_REMINDER, HEARTBEAT_INTERVAL_MS } from './lib/constants';
import { isValidMessage } from './lib/messages';
import type { LogEntry } from './lib/types';

/** Helper to validate message sender origins. */
function isMessageSenderValid(sender: chrome.runtime.MessageSender): boolean {
  // Check extension ID matches
  if (sender.id !== chrome.runtime.id) {
    return false;
  }

  // If sender has a tab, it's a content script. Verify it's youtube.com
  if (sender.tab) {
    const url = sender.url || sender.tab.url;
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com');
    } catch {
      return false;
    }
  }

  // If sender has no tab, it's extension internal (popup, options, etc)
  if (sender.url) {
    const extPrefix = chrome.runtime.getURL('');
    return sender.url.startsWith(extPrefix);
  }

  return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (!isMessageSenderValid(sender)) {
      console.warn('YT AutoLike Security: Blocked message from invalid sender', sender);
      sendResponse({ error: 'invalid sender' });
      return;
    }

    if (!isValidMessage(message)) {
      console.warn('YT AutoLike Security: Blocked message with invalid schema', message);
      sendResponse({ error: 'invalid schema' });
      return;
    }

    switch (message.type) {
      // -----------------------------------------------------------------------
      // Content script heartbeat — called every HEARTBEAT_INTERVAL_MS while
      // the user is actively watching (tab visible + video playing).
      // -----------------------------------------------------------------------
      case 'HEARTBEAT': {
        const stats = await getStats();
        const secondsToAdd = HEARTBEAT_INTERVAL_MS / 1000;
        const newAccumulated = stats.accumulated_watch_seconds + secondsToAdd;

        if (newAccumulated >= WATCH_SECONDS_PER_REMINDER) {
          await setStats({ ...stats, accumulated_watch_seconds: 0 });
          sendResponse({ type: 'SHOW_REMINDER' });
        } else {
          await setStats({ ...stats, accumulated_watch_seconds: newAccumulated });
          sendResponse({ type: 'HEARTBEAT_ACK' });
        }
        break;
      }

      // -----------------------------------------------------------------------
      // Content script reports a successful auto-like.
      // -----------------------------------------------------------------------
      case 'RECORD_LIKE': {
        const entry: LogEntry = message.entry;
        const stats = await getStats();
        await setStats({ ...stats, total_likes_performed: stats.total_likes_performed + 1 });
        await appendLog(entry);
        sendResponse({ ok: true });
        break;
      }

      // -----------------------------------------------------------------------
      // Content script reports a skipped like.
      // -----------------------------------------------------------------------
      case 'RECORD_SKIP': {
        const entry: LogEntry = message.entry;
        await appendLog(entry);
        sendResponse({ ok: true });
        break;
      }

      // -----------------------------------------------------------------------
      // Popup notifies background it is open.
      // -----------------------------------------------------------------------
      case 'POPUP_OPENED': {
        await chrome.storage.session.set({ popupOpen: true });
        sendResponse({ ok: true });
        break;
      }

      // -----------------------------------------------------------------------
      // Popup notifies background it is closing.
      // -----------------------------------------------------------------------
      case 'POPUP_CLOSED': {
        await chrome.storage.session.set({ popupOpen: false });
        sendResponse({ ok: true });
        break;
      }

      // -----------------------------------------------------------------------
      // Content script asks whether the popup is currently open.
      // -----------------------------------------------------------------------
      case 'IS_POPUP_OPEN': {
        const session = await chrome.storage.session.get('popupOpen');
        sendResponse({ type: 'IS_POPUP_OPEN_RESPONSE', open: !!session.popupOpen });
        break;
      }

      default:
        sendResponse({ error: 'unknown message type' });
        break;
    }
  })();

  // Return true to keep the message channel open for async sendResponse.
  return true;
});

// ---------------------------------------------------------------------------
// On install / update: initialise storage defaults if missing.
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  const [existingSync, existingLocal] = await Promise.all([
    chrome.storage.sync.get(['settings', 'whitelist']),
    chrome.storage.local.get(['stats', 'logs']),
  ]);

  const syncDefaults: Record<string, unknown> = {};
  if (!existingSync.settings) syncDefaults.settings = DEFAULT_SETTINGS;
  if (!existingSync.whitelist) syncDefaults.whitelist = DEFAULT_WHITELIST;

  const localDefaults: Record<string, unknown> = {};
  if (!existingLocal.stats) localDefaults.stats = DEFAULT_STATS;
  if (!existingLocal.logs) localDefaults.logs = [];

  await Promise.all([
    Object.keys(syncDefaults).length > 0 ? chrome.storage.sync.set(syncDefaults) : undefined,
    Object.keys(localDefaults).length > 0 ? chrome.storage.local.set(localDefaults) : undefined,
  ]);
});
