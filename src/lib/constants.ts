/**
 * Extension-wide constants.
 */

/** Number of active watch seconds before the periodic reminder fires (15 minutes). */
export const WATCH_SECONDS_PER_REMINDER = 900;

/** Maximum number of log entries retained in local storage. */
export const MAX_LOGS = 50;

/** Duration in ms the toast message stays visible before auto-closing. */
export const TOAST_DURATION_MS = 5000;

/** Heartbeat interval in ms (content script pings background). */
export const HEARTBEAT_INTERVAL_MS = 5_000;

/** How often (ms) the watch-progress polling loop runs. */
export const PROGRESS_POLL_INTERVAL_MS = 500;

/** Minimum watch percentage the user can configure (as a fraction). */
export const MIN_PERCENTAGE = 0.1;

/** Maximum watch percentage the user can configure (as a fraction). */
export const MAX_PERCENTAGE = 0.9;

/** Default watch percentage trigger (50%). */
export const DEFAULT_PERCENTAGE = 0.5;
