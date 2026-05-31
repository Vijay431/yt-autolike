/**
 * Shared TypeScript types for the YT AutoLike extension.
 * These types mirror the chrome.storage.local schema defined in the TRD.
 */

/** The four targeting modes for auto-like behaviour. */
export type Mode = 'global' | 'only_shorts' | 'only_videos' | 'whitelist_only';

/** User-facing settings stored in chrome.storage.local under the key "settings". */
export interface Settings {
  /** Which videos/shorts to auto-like. */
  mode: Mode;
  /** Fraction (0.1–0.9). Like triggers when currentTime/duration >= this value. */
  target_percentage: number;
  /** Whether the hourly positive-message toast should appear. */
  hourly_reminders_enabled: boolean;
  /** Master pause: when true the engine skips all auto-like logic. */
  is_paused: boolean;
}

/** A single whitelisted YouTube channel. */
export interface WhitelistEntry {
  id: string;
  name: string;
  added_at: number; // Unix timestamp ms
}

/** The whitelist stored under the key "whitelist". */
export interface Whitelist {
  channels: WhitelistEntry[];
}

/** Aggregate statistics stored under the key "stats". */
export interface Stats {
  total_likes_performed: number;
  /** Cumulative active-watch seconds; resets every 3600s to trigger the reminder. */
  accumulated_watch_seconds: number;
}

/** Type of YouTube page the content script is running on. */
export type PageType = 'video' | 'short';

/** A single activity-log entry stored under the key "logs" (max 50 entries). */
export interface LogEntry {
  timestamp: number; // Unix ms
  title: string;
  channel: string;
  type: PageType;
  status: 'liked' | 'skipped' | 'error';
  reason?: string;
}

/** Live state of the currently playing video/short, returned by the content script. */
export interface VideoState {
  /** True if a video/short page is active. */
  isVideoPage: boolean;
  /** True if the user is logged in to YouTube. */
  isLoggedIn: boolean;
  /** Video title (null if not a video page). */
  title: string | null;
  /** Channel name (null if not a video page). */
  channelName: string | null;
  /** Channel ID (null if not a video page). */
  channelId: string | null;
  /** Page type — 'video' or 'short' (null if not a video page). */
  pageType: PageType | null;
  /** Current playback position in seconds (null if not available). */
  currentTime: number | null;
  /** Total duration in seconds (null if not available). */
  duration: number | null;
  /** Whether the video has already been liked in this session. */
  alreadyLiked: boolean;
  /**
   * Seconds the user has genuinely watched in this video session.
   * Incremented only when video is playing — NOT when seeking.
   * This is the value compared against the like threshold.
   */
  accumulatedWatchSeconds: number;
}

// ---------------------------------------------------------------------------
// Message types exchanged between content script, popup, and background SW.
// ---------------------------------------------------------------------------

export type Message =
  | { type: 'HEARTBEAT' }
  | { type: 'SHOW_REMINDER' }
  | { type: 'IS_POPUP_OPEN' }
  | { type: 'IS_POPUP_OPEN_RESPONSE'; open: boolean }
  | { type: 'POPUP_OPENED' }
  | { type: 'POPUP_CLOSED' }
  | { type: 'RECORD_LIKE'; entry: LogEntry }
  | { type: 'RECORD_SKIP'; entry: LogEntry }
  | { type: 'GET_ACTIVE_TAB_INFO'; response?: ActiveTabInfo }
  | { type: 'ACTIVE_TAB_INFO'; info: ActiveTabInfo }
  | { type: 'GET_VIDEO_STATE' };

/** Channel metadata extracted from the active tab, sent by the popup. */
export interface ActiveTabInfo {
  tabId: number;
  url: string;
  channelId: string | null;
  channelName: string | null;
  isYouTube: boolean;
}
