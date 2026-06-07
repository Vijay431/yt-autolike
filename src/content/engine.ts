/**
 * Auto-Like Engine — YT AutoLike
 *
 * Injected into every youtube.com page by the content script.
 * Handles:
 *  - SPA navigation (YouTube is a SPA using the History API / yt-navigate-finish events)
 *  - Page type detection (standard video vs. Shorts)
 *  - Targeting mode enforcement
 *  - Whitelist channel matching
 *  - Watch percentage threshold triggering
 *  - Like/dislike state detection (skip if already voted)
 *  - Login state detection (skip if logged out)
 *  - Active-watching guard (visible tab OR popup open)
 *  - Guarded like click
 *  - Heartbeat to background worker
 *  - Periodic reminder toast trigger
 */

import { getSettings, getWhitelist } from '../lib/storage';
import { HEARTBEAT_INTERVAL_MS, PROGRESS_POLL_INTERVAL_MS } from '../lib/constants';
import { showReminderToast, showToast } from './toast';
import confetti from 'canvas-confetti';
import type { PageType, LogEntry, Settings, Whitelist } from '../lib/types';
import {
  getActiveVideo,
  isLoggedIn,
  findVideoLikeButton,
  findVideoDislikeButton,
  findShortsLikeButton,
  findShortsDislikeButton,
  getChannelId,
  getChannelName,
  getVideoTitle,
} from './selectors';

// ---------------------------------------------------------------------------
// Module-level cleanup handles (so we can teardown on SPA navigation).
// ---------------------------------------------------------------------------

let progressInterval: ReturnType<typeof setInterval> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let likedThisVideo = false; // reset per navigation
let accumulatedWatchSeconds = 0; // genuine watch seconds — seek-proof, reset per navigation

let currentVideoId: string | null = null;
let cachedSettings: Settings | null = null;
let notifiedSettingsChange = false;

/**
 * Reentrancy guard for pollProgress.
 */
let pollInProgress = false;

/**
 * Set to true between yt-navigate-finish and initForCurrentPage completing.
 */
let isNavigating = false;
let navigateTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Permanent shutdown flag — set to true when the extension context is
 * invalidated. Once true, every interval tick exits immediately.
 */
let engineDestroyed = false;

// ---------------------------------------------------------------------------
// Context validity guard
// ---------------------------------------------------------------------------

function isContextAlive(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

function destroyEngine(): void {
  if (engineDestroyed) return;
  engineDestroyed = true;
  teardown();

  document.removeEventListener('yt-navigate-finish', onNavigateFinish);
  try {
    chrome.runtime.onMessage.removeListener(onMessage);
  } catch {
    // ignore context invalidation errors
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function startEngine(): void {
  if (!isContextAlive()) return;

  initForCurrentPage();
  document.addEventListener('yt-navigate-finish', onNavigateFinish);
  chrome.runtime.onMessage.addListener(onMessage);
}

function onNavigateFinish(): void {
  if (!isContextAlive()) {
    destroyEngine();
    return;
  }
  isNavigating = true;
  teardown();
  if (navigateTimeout !== null) {
    clearTimeout(navigateTimeout);
  }
  navigateTimeout = setTimeout(() => {
    navigateTimeout = null;
    if (!isContextAlive()) {
      destroyEngine();
      return;
    }
    initForCurrentPage();
  }, 800);
}

function onMessage(
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean | void {
  if (!isContextAlive()) {
    destroyEngine();
    return;
  }

  const msg = message as Record<string, unknown> | null | undefined;
  const pathKey = currentVideoId || location.pathname;

  if (msg?.type === 'GET_CHANNEL_INFO') {
    const pageType = getPageType();
    sendResponse({
      channelId: pageType ? getChannelId(pageType, pathKey) : null,
      channelName: pageType ? getChannelName(pageType, pathKey) : null,
    });
  }

  if (msg?.type === 'GET_VIDEO_STATE') {
    const pageType = getPageType();
    const video = getActiveVideo(pageType);
    sendResponse({
      isVideoPage: pageType !== null,
      isLoggedIn: isLoggedIn(),
      title: pageType ? getVideoTitle(pageType, pathKey) : null,
      channelName: pageType ? getChannelName(pageType, pathKey) : null,
      channelId: pageType ? getChannelId(pageType, pathKey) : null,
      pageType,
      currentTime: video && !isNaN(video.currentTime) ? video.currentTime : null,
      duration: isNavigating
        ? null
        : video && !isNaN(video.duration) && video.duration > 0
          ? video.duration
          : null,
      alreadyLiked: likedThisVideo,
      accumulatedWatchSeconds,
    });
  }
}

// ---------------------------------------------------------------------------
// Per-page initialisation
// ---------------------------------------------------------------------------

function initForCurrentPage(): void {
  isNavigating = false;
  likedThisVideo = false;
  accumulatedWatchSeconds = 0;
  currentVideoId = location.pathname;
  cachedSettings = null;
  notifiedSettingsChange = false;
  pollInProgress = false;
  teardown();

  const pageType = getPageType();
  if (!pageType) return;

  progressInterval = setInterval(() => {
    if (engineDestroyed || !isContextAlive()) {
      destroyEngine();
      return;
    }
    pollProgress(pageType);
  }, PROGRESS_POLL_INTERVAL_MS);

  heartbeatInterval = setInterval(() => {
    if (engineDestroyed || !isContextAlive()) {
      destroyEngine();
      return;
    }
    sendHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);
}

function teardown(): void {
  pollInProgress = false;
  if (progressInterval !== null) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (navigateTimeout !== null) {
    clearTimeout(navigateTimeout);
    navigateTimeout = null;
  }
}

function getPageType(): PageType | null {
  const path = location.pathname;
  if (path.startsWith('/shorts/')) return 'short';
  if (path.startsWith('/watch')) return 'video';
  return null;
}

// ---------------------------------------------------------------------------
// Watch-progress polling loop
// ---------------------------------------------------------------------------

async function pollProgress(pageType: PageType): Promise<void> {
  if (pollInProgress) return;
  pollInProgress = true;

  try {
    if (currentVideoId && currentVideoId !== location.pathname) {
      initForCurrentPage();
      return;
    }

    const video = getActiveVideo(pageType);
    const videoReady = video && !isNaN(video.duration) && video.duration > 0;
    if (!videoReady || video!.paused) return;

    if (document.visibilityState === 'visible') {
      accumulatedWatchSeconds += PROGRESS_POLL_INTERVAL_MS / 1000;
    }

    if (likedThisVideo) return;

    if (!isContextAlive()) {
      destroyEngine();
      return;
    }

    if (!(await isActivelyWatching())) return;

    if (!isContextAlive()) {
      destroyEngine();
      return;
    }

    let liveSettings: Settings;
    try {
      liveSettings = await getSettings();
    } catch {
      return;
    }
    if (!isContextAlive()) {
      destroyEngine();
      return;
    }

    if (!cachedSettings) {
      cachedSettings = liveSettings;
    } else {
      const settingsChanged = JSON.stringify(liveSettings) !== JSON.stringify(cachedSettings);
      if (settingsChanged && !notifiedSettingsChange) {
        notifiedSettingsChange = true;
        showToast('Settings Saved', 'Changes will take effect from the next video/shorts.');
      }
    }

    const settings = cachedSettings;

    const voteState = getLikeState(pageType);
    if (voteState === 'liked' || voteState === 'disliked') {
      likedThisVideo = true;
      await recordSkip(pageType, voteState === 'liked' ? 'already liked' : 'already disliked');
      return;
    }

    const targetSeconds = video!.duration * settings.target_percentage;
    if (accumulatedWatchSeconds < targetSeconds) return;

    let passesMode: boolean;
    try {
      passesMode = await checkMode(settings, pageType);
    } catch {
      return;
    }
    if (!isContextAlive()) {
      destroyEngine();
      return;
    }
    if (!passesMode) return;

    if (!isLoggedIn()) return;

    const clicked = clickLikeButton(pageType);
    if (clicked) {
      likedThisVideo = true;
      await recordLike(pageType);
      showToast('Auto-Liked!', '🎉 We successfully auto-liked this video!');
      triggerConfetti();
    }
  } finally {
    pollInProgress = false;
  }
}

// ---------------------------------------------------------------------------
// Active-watching guard
// ---------------------------------------------------------------------------

async function isActivelyWatching(): Promise<boolean> {
  if (document.visibilityState === 'visible') return true;
  if (!isContextAlive()) return false;
  try {
    const response = await chrome.runtime.sendMessage({ type: 'IS_POPUP_OPEN' });
    return response?.open === true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Targeting mode check
// ---------------------------------------------------------------------------

async function checkMode(settings: Settings, pageType: PageType): Promise<boolean> {
  switch (settings.mode) {
    case 'global':
      return true;
    case 'only_shorts':
      return pageType === 'short';
    case 'only_videos':
      return pageType === 'video';
    case 'whitelist_only': {
      let whitelist: Whitelist;
      try {
        whitelist = await getWhitelist();
      } catch {
        return false;
      }
      const pathKey = currentVideoId || location.pathname;
      const channelId = getChannelId(pageType, pathKey);
      const channelName = getChannelName(pageType, pathKey);
      return whitelist.channels.some(
        (c) =>
          (channelId && c.id === channelId) ||
          (channelName && c.name.toLowerCase() === channelName.toLowerCase()),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Like / dislike state detection
// ---------------------------------------------------------------------------

type VoteState = 'liked' | 'disliked' | 'none';

export type AutoLikeDecisionInput = {
  settings: Settings;
  pageType: PageType;
  whitelist: Whitelist;
  channelId: string | null;
  channelName: string | null;
  voteState: VoteState;
  isLoggedIn: boolean;
  isActivelyWatching: boolean;
};

export type AutoLikeDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | 'not active'
        | 'mode mismatch'
        | 'not whitelisted'
        | 'logged out'
        | 'already liked'
        | 'already disliked';
    };

export function hasReachedThreshold(
  watchedSeconds: number,
  durationSeconds: number,
  targetPercentage: number,
): boolean {
  return watchedSeconds >= durationSeconds * targetPercentage;
}

export function canAutoLike(input: AutoLikeDecisionInput): AutoLikeDecision {
  if (!input.isActivelyWatching) return { allowed: false, reason: 'not active' };

  switch (input.settings.mode) {
    case 'only_shorts':
      if (input.pageType !== 'short') return { allowed: false, reason: 'mode mismatch' };
      break;
    case 'only_videos':
      if (input.pageType !== 'video') return { allowed: false, reason: 'mode mismatch' };
      break;
    case 'whitelist_only': {
      const whitelisted = input.whitelist.channels.some(
        (channel) =>
          (input.channelId && channel.id === input.channelId) ||
          (input.channelName && channel.name.toLowerCase() === input.channelName.toLowerCase()),
      );
      if (!whitelisted) return { allowed: false, reason: 'not whitelisted' };
      break;
    }
    case 'global':
      break;
  }

  if (!input.isLoggedIn) return { allowed: false, reason: 'logged out' };
  if (input.voteState === 'liked') return { allowed: false, reason: 'already liked' };
  if (input.voteState === 'disliked') return { allowed: false, reason: 'already disliked' };

  return { allowed: true };
}

function getLikeState(pageType: PageType): VoteState {
  if (pageType === 'video') {
    const likeButton = findVideoLikeButton();
    if (!likeButton) return 'none';
    if (likeButton.getAttribute('aria-pressed') === 'true') return 'liked';

    const dislikeButton = findVideoDislikeButton();
    if (dislikeButton?.getAttribute('aria-pressed') === 'true') return 'disliked';

    return 'none';
  } else {
    const likeBtn = findShortsLikeButton();
    if (!likeBtn) return 'none';
    if (likeBtn.getAttribute('aria-pressed') === 'true') return 'liked';

    const dislikeBtn = findShortsDislikeButton();
    if (dislikeBtn?.getAttribute('aria-pressed') === 'true') return 'disliked';

    return 'none';
  }
}

// ---------------------------------------------------------------------------
// Guarded like click

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    zIndex: 2147483647
  });
}
// ---------------------------------------------------------------------------

function clickLikeButton(pageType: PageType): boolean {
  const btn = pageType === 'video' ? findVideoLikeButton() : findShortsLikeButton();
  if (!btn) return false;
  btn.click();
  return true;
}

// ---------------------------------------------------------------------------
// Heartbeat
// ---------------------------------------------------------------------------

async function sendHeartbeat(): Promise<void> {
  if (document.visibilityState !== 'visible') return;
  const video = getActiveVideo(getPageType());
  if (!video || video.paused) return;
  if (!isContextAlive()) {
    destroyEngine();
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({ type: 'HEARTBEAT' });
    if (!isContextAlive()) {
      destroyEngine();
      return;
    }
    if (response?.type === 'SHOW_REMINDER') {
      let settings: Settings;
      try {
        settings = await getSettings();
      } catch {
        return;
      }
      if (settings.hourly_reminders_enabled) {
        showReminderToast();
      }
    }
  } catch {
    // Background SW may not be ready yet or context is dying.
  }
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

async function recordLike(pageType: PageType): Promise<void> {
  if (!isContextAlive()) return;
  const pathKey = currentVideoId || location.pathname;
  const entry: LogEntry = {
    timestamp: Date.now(),
    title: getVideoTitle(pageType, pathKey),
    channel: getChannelName(pageType, pathKey) ?? 'Unknown',
    type: pageType,
    status: 'liked',
  };
  try {
    await chrome.runtime.sendMessage({ type: 'RECORD_LIKE', entry });
  } catch {
    // SW may be restarting or context invalidated.
  }
}

async function recordSkip(pageType: PageType, reason: string): Promise<void> {
  if (!isContextAlive()) return;
  const pathKey = currentVideoId || location.pathname;
  const entry: LogEntry = {
    timestamp: Date.now(),
    title: getVideoTitle(pageType, pathKey),
    channel: getChannelName(pageType, pathKey) ?? 'Unknown',
    type: pageType,
    status: 'skipped',
    reason,
  };
  try {
    await chrome.runtime.sendMessage({ type: 'RECORD_SKIP', entry });
  } catch {
    // SW may be restarting or context invalidated.
  }
}
