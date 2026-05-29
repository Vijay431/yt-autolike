/**
 * Auto-Like Engine — Auto Like YT Videos
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

import {getSettings, getWhitelist} from '../lib/storage'
import {HEARTBEAT_INTERVAL_MS, PROGRESS_POLL_INTERVAL_MS} from '../lib/constants'
import {showReminderToast} from './toast'
import type {PageType, LogEntry, Settings, Whitelist} from '../lib/types'

// ---------------------------------------------------------------------------
// Module-level cleanup handles (so we can teardown on SPA navigation).
// ---------------------------------------------------------------------------

let progressInterval: ReturnType<typeof setInterval> | null = null
let heartbeatInterval: ReturnType<typeof setInterval> | null = null
let likedThisVideo = false        // reset per navigation
let accumulatedWatchSeconds = 0   // genuine watch seconds — seek-proof, reset per navigation

/**
 * Permanent shutdown flag — set to true when the extension context is
 * invalidated (e.g. after an extension reload/update). Once true, every
 * interval tick exits immediately without touching any Chrome API.
 */
let engineDestroyed = false

// ---------------------------------------------------------------------------
// Context validity guard
// ---------------------------------------------------------------------------

/**
 * Returns true while the extension runtime context is still alive.
 * Accessing chrome.runtime.id throws "Extension context invalidated"
 * once the extension is reloaded/updated, making it the best canary.
 */
function isContextAlive(): boolean {
  try {
    return !!chrome.runtime?.id
  } catch {
    return false
  }
}

/**
 * Permanently shuts down the engine and clears all intervals.
 * Called either on context invalidation or manual teardown.
 */
function destroyEngine(): void {
  engineDestroyed = true
  teardown()
}

// ---------------------------------------------------------------------------
// Public entry point — called once by scripts.ts on injection.
// ---------------------------------------------------------------------------

export function startEngine(): void {
  // If somehow this is called after context death, do nothing.
  if (!isContextAlive()) return

  initForCurrentPage()

  // YouTube fires 'yt-navigate-finish' on every SPA navigation.
  document.addEventListener('yt-navigate-finish', () => {
    if (!isContextAlive()) { destroyEngine(); return }
    teardown()
    // Slight delay to let YouTube finish rendering the new page's DOM.
    setTimeout(() => {
      if (!isContextAlive()) { destroyEngine(); return }
      initForCurrentPage()
    }, 800)
  })

  // Respond to popup requests for channel info and video state.
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isContextAlive()) { destroyEngine(); return }

    if (message?.type === 'GET_CHANNEL_INFO') {
      const pageType = getPageType()
      sendResponse({
        channelId: pageType ? getChannelId(pageType) : null,
        channelName: pageType ? getChannelName(pageType) : null,
      })
    }

    if (message?.type === 'GET_VIDEO_STATE') {
      const pageType = getPageType()
      const video = document.querySelector<HTMLVideoElement>('video')
      sendResponse({
        isVideoPage: pageType !== null,
        isLoggedIn: isLoggedIn(),
        title: pageType ? getVideoTitle() : null,
        channelName: pageType ? getChannelName(pageType) : null,
        channelId: pageType ? getChannelId(pageType) : null,
        pageType,
        currentTime: video && !isNaN(video.currentTime) ? video.currentTime : null,
        duration: video && !isNaN(video.duration) && video.duration > 0 ? video.duration : null,
        alreadyLiked: likedThisVideo,
        accumulatedWatchSeconds,
      })
    }
    // Non-async, no need to return true.
  })
}

// ---------------------------------------------------------------------------
// Per-page initialisation
// ---------------------------------------------------------------------------

function initForCurrentPage(): void {
  likedThisVideo = false
  accumulatedWatchSeconds = 0
  teardown()

  const pageType = getPageType()
  if (!pageType) return // Not a watch or Shorts page.

  // Start the watch-progress poller.
  progressInterval = setInterval(() => {
    if (engineDestroyed || !isContextAlive()) { destroyEngine(); return }
    pollProgress(pageType)
  }, PROGRESS_POLL_INTERVAL_MS)

  // Start heartbeat sender.
  heartbeatInterval = setInterval(() => {
    if (engineDestroyed || !isContextAlive()) { destroyEngine(); return }
    sendHeartbeat()
  }, HEARTBEAT_INTERVAL_MS)
}

// ---------------------------------------------------------------------------
// Teardown (called on SPA navigation or context death)
// ---------------------------------------------------------------------------

function teardown(): void {
  if (progressInterval !== null) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

// ---------------------------------------------------------------------------
// Page type detection
// ---------------------------------------------------------------------------

function getPageType(): PageType | null {
  const path = location.pathname
  if (path.startsWith('/shorts/')) return 'short'
  if (path.startsWith('/watch')) return 'video'
  return null
}

// ---------------------------------------------------------------------------
// Watch-progress polling loop
// ---------------------------------------------------------------------------

async function pollProgress(pageType: PageType): Promise<void> {
  // ── Step 1: Accumulate genuine watch time (synchronous, no Chrome API needed) ──
  // This runs before any guards so the count grows only from real playback.
  // Seeking does NOT affect this counter — it's purely time-based.
  const video = document.querySelector<HTMLVideoElement>('video')
  const videoReady = video && !isNaN(video.duration) && video.duration > 0
  if (videoReady && !video!.paused && document.visibilityState === 'visible') {
    // Each poll tick represents PROGRESS_POLL_INTERVAL_MS milliseconds of real watch time.
    accumulatedWatchSeconds += PROGRESS_POLL_INTERVAL_MS / 1000
  }

  // ── Step 2: Like-eligibility guards (all the async checks) ──

  // Guard: already liked this video in this session.
  if (likedThisVideo) return

  if (!videoReady || video!.paused) return

  // Guard: context must still be alive before any async Chrome API call.
  if (!isContextAlive()) { destroyEngine(); return }

  // Guard: user must be actively watching.
  if (!(await isActivelyWatching())) return

  // Re-check after the await — the context may have died during the async gap.
  if (!isContextAlive()) { destroyEngine(); return }

  let settings: Settings
  try {
    settings = await getSettings()
  } catch {
    return // Storage unavailable — context likely dying.
  }
  if (!isContextAlive()) { destroyEngine(); return }

  // Guard: master pause.
  if (settings.is_paused) return

  // Guard: accumulated watch time threshold (seek-proof).
  // Unlike position-based checks, this can only increase through genuine playback.
  const targetSeconds = video!.duration * settings.target_percentage
  if (accumulatedWatchSeconds < targetSeconds) return

  // Guard: targeting mode.
  let passesMode: boolean
  try {
    passesMode = await checkMode(settings, pageType)
  } catch {
    return
  }
  if (!isContextAlive()) { destroyEngine(); return }
  if (!passesMode) return

  // Guard: user must be logged in.
  if (!isLoggedIn()) return

  // Guard: video must not already be liked or disliked.
  const voteState = getLikeState(pageType)
  if (voteState === 'liked' || voteState === 'disliked') {
    likedThisVideo = true
    await recordSkip(pageType, voteState === 'liked' ? 'already liked' : 'already disliked')
    return
  }

  // All checks passed — perform the like.
  const clicked = clickLikeButton(pageType)
  if (clicked) {
    likedThisVideo = true
    await recordLike(pageType)
  }
}


// ---------------------------------------------------------------------------
// Active-watching guard
// ---------------------------------------------------------------------------

async function isActivelyWatching(): Promise<boolean> {
  // Tab is visible — no Chrome API needed.
  if (document.visibilityState === 'visible') return true

  // Extension popup is open (background tracks this via POPUP_OPENED/POPUP_CLOSED).
  if (!isContextAlive()) return false
  try {
    const response = await chrome.runtime.sendMessage({type: 'IS_POPUP_OPEN'})
    return response?.open === true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Login state
// ---------------------------------------------------------------------------

function isLoggedIn(): boolean {
  // YouTube renders a sign-in button when logged out; the avatar button when in.
  const signInButton = document.querySelector('a[href*="accounts.google.com"]')
  const avatarButton = document.querySelector('#avatar-btn')
  if (avatarButton) return true
  if (signInButton) return false
  // Fallback: assume logged in if neither indicator is found.
  return true
}

// ---------------------------------------------------------------------------
// Targeting mode check
// ---------------------------------------------------------------------------

async function checkMode(settings: Settings, pageType: PageType): Promise<boolean> {
  switch (settings.mode) {
    case 'global':
      return true
    case 'only_shorts':
      return pageType === 'short'
    case 'only_videos':
      return pageType === 'video'
    case 'whitelist_only': {
      let whitelist: Whitelist
      try {
        whitelist = await getWhitelist()
      } catch {
        return false
      }
      const channelId = getChannelId(pageType)
      const channelName = getChannelName(pageType)
      return whitelist.channels.some(
        (c) =>
          (channelId && c.id === channelId) ||
          (channelName && c.name.toLowerCase() === channelName.toLowerCase()),
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Like / dislike state detection
// ---------------------------------------------------------------------------

type VoteState = 'liked' | 'disliked' | 'none'

function getLikeState(pageType: PageType): VoteState {
  if (pageType === 'video') {
    return getVideoLikeState()
  } else {
    return getShortsLikeState()
  }
}

function getVideoLikeState(): VoteState {
  // Try multiple selector strategies for robustness.
  const likeButton = findVideoLikeButton()
  if (!likeButton) return 'none'

  // YouTube sets aria-pressed="true" on the active like/dislike button.
  if (likeButton.getAttribute('aria-pressed') === 'true') return 'liked'

  const dislikeButton = findVideoDislikeButton()
  if (dislikeButton?.getAttribute('aria-pressed') === 'true') return 'disliked'

  return 'none'
}

function getShortsLikeState(): VoteState {
  const likeBtn = findShortsLikeButton()
  if (!likeBtn) return 'none'
  if (likeBtn.getAttribute('aria-pressed') === 'true') return 'liked'

  const dislikeBtn = findShortsDislikeButton()
  if (dislikeBtn?.getAttribute('aria-pressed') === 'true') return 'disliked'

  return 'none'
}

// ---------------------------------------------------------------------------
// Guarded like click
// ---------------------------------------------------------------------------

function clickLikeButton(pageType: PageType): boolean {
  const btn = pageType === 'video' ? findVideoLikeButton() : findShortsLikeButton()
  if (!btn) return false

  btn.click()
  return true
}

// ---------------------------------------------------------------------------
// DOM selector helpers (modular for easy updates when YouTube changes its DOM)
// ---------------------------------------------------------------------------

function findVideoLikeButton(): HTMLButtonElement | null {
  // Strategy 1: like-button-view-model (newer YouTube)
  const newStyle = document.querySelector<HTMLButtonElement>(
    'like-button-view-model button[aria-label]',
  )
  if (newStyle) return newStyle

  // Strategy 2: ytd-watch-metadata top-level like button
  const watchMeta = document.querySelector<HTMLButtonElement>(
    'ytd-watch-metadata #top-level-buttons-computed ytd-toggle-button-renderer:first-child button',
  )
  if (watchMeta) return watchMeta

  // Strategy 3: segmented like/dislike button (ytd-segmented-like-dislike-button-renderer)
  const segmented = document.querySelector<HTMLButtonElement>(
    'ytd-segmented-like-dislike-button-renderer #like-button button',
  )
  if (segmented) return segmented

  // Strategy 4: aria-label contains "like" (case-insensitive, not "dislike")
  const all = document.querySelectorAll<HTMLButtonElement>('button[aria-label]')
  for (const btn of all) {
    const label = btn.getAttribute('aria-label')?.toLowerCase() ?? ''
    if (label.includes('like') && !label.includes('dislike')) {
      return btn
    }
  }

  return null
}

function findVideoDislikeButton(): HTMLButtonElement | null {
  // Strategy 1: newer YouTube
  const newStyle = document.querySelector<HTMLButtonElement>(
    'dislike-button-view-model button[aria-label]',
  )
  if (newStyle) return newStyle

  // Strategy 2: segmented
  const segmented = document.querySelector<HTMLButtonElement>(
    'ytd-segmented-like-dislike-button-renderer #dislike-button button',
  )
  if (segmented) return segmented

  // Strategy 3: aria-label includes "dislike"
  const all = document.querySelectorAll<HTMLButtonElement>('button[aria-label]')
  for (const btn of all) {
    const label = btn.getAttribute('aria-label')?.toLowerCase() ?? ''
    if (label.includes('dislike')) return btn
  }

  return null
}

function findShortsLikeButton(): HTMLButtonElement | null {
  // Shorts active renderer is the one not hidden.
  const containers = document.querySelectorAll<Element>('ytd-reel-video-renderer')
  for (const container of containers) {
    if (!isElementVisible(container as HTMLElement)) continue

    // Strategy 1: like-button-view-model inside shorts container
    const btn = container.querySelector<HTMLButtonElement>(
      'like-button-view-model button, ytd-like-button-renderer button',
    )
    if (btn) return btn
  }

  // Fallback: ytd-shorts like button
  return document.querySelector<HTMLButtonElement>(
    'ytd-shorts like-button-view-model button, ytd-shorts ytd-like-button-renderer button',
  )
}

function findShortsDislikeButton(): HTMLButtonElement | null {
  const containers = document.querySelectorAll<Element>('ytd-reel-video-renderer')
  for (const container of containers) {
    if (!isElementVisible(container as HTMLElement)) continue
    const btn = container.querySelector<HTMLButtonElement>(
      'dislike-button-view-model button, ytd-dislike-button-renderer button',
    )
    if (btn) return btn
  }
  return document.querySelector<HTMLButtonElement>(
    'ytd-shorts dislike-button-view-model button, ytd-shorts ytd-dislike-button-renderer button',
  )
}

function isElementVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

// ---------------------------------------------------------------------------
// Channel metadata extraction (for whitelist mode + logging)
// ---------------------------------------------------------------------------

export function getChannelId(_pageType: PageType): string | null {
  // Standard video: channel link href contains /channel/UC... or /@handle
  const channelLink = document.querySelector<HTMLAnchorElement>(
    'ytd-video-owner-renderer a, ytd-watch-metadata a.yt-simple-endpoint[href*="/channel/"], ytd-watch-metadata a.yt-simple-endpoint[href*="/@"]',
  )
  if (channelLink) {
    const href = channelLink.getAttribute('href') ?? ''
    const match = href.match(/\/channel\/(UC[^/?]+)/)
    if (match) return match[1]
  }
  return null
}

export function getChannelName(_pageType: PageType): string | null {
  // Standard video: owner renderer
  const ownerName = document.querySelector<HTMLElement>(
    'ytd-video-owner-renderer #channel-name a, ytd-watch-metadata #owner-name a',
  )
  if (ownerName?.textContent?.trim()) return ownerName.textContent.trim()

  // Shorts: active short's owner
  const shortsOwner = document.querySelector<HTMLElement>(
    'ytd-reel-video-renderer #channel-info a, ytd-shorts #channel-info a',
  )
  if (shortsOwner?.textContent?.trim()) return shortsOwner.textContent.trim()

  return null
}

function getVideoTitle(): string {
  return (
    document.querySelector<HTMLElement>('ytd-watch-metadata #title h1')?.textContent?.trim() ??
    document.querySelector<HTMLElement>('h1.title')?.textContent?.trim() ??
    document.title ??
    'Unknown title'
  )
}

// ---------------------------------------------------------------------------
// Heartbeat
// ---------------------------------------------------------------------------

async function sendHeartbeat(): Promise<void> {
  if (document.visibilityState !== 'visible') return
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video || video.paused) return
  if (!isContextAlive()) { destroyEngine(); return }

  try {
    const response = await chrome.runtime.sendMessage({type: 'HEARTBEAT'})
    if (!isContextAlive()) { destroyEngine(); return }
    if (response?.type === 'SHOW_REMINDER') {
      let settings: Settings
      try {
        settings = await getSettings()
      } catch {
        return
      }
      if (settings.hourly_reminders_enabled) {
        showReminderToast()
      }
    }
  } catch {
    // Background SW may not be ready yet or context is dying — ignore.
  }
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

async function recordLike(pageType: PageType): Promise<void> {
  if (!isContextAlive()) return
  const entry: LogEntry = {
    timestamp: Date.now(),
    title: getVideoTitle(),
    channel: getChannelName(pageType) ?? 'Unknown',
    type: pageType,
    status: 'liked',
  }
  try {
    await chrome.runtime.sendMessage({type: 'RECORD_LIKE', entry})
  } catch {
    // SW may be restarting or context invalidated.
  }
}

async function recordSkip(pageType: PageType, reason: string): Promise<void> {
  if (!isContextAlive()) return
  const entry: LogEntry = {
    timestamp: Date.now(),
    title: getVideoTitle(),
    channel: getChannelName(pageType) ?? 'Unknown',
    type: pageType,
    status: 'skipped',
    reason,
  }
  try {
    await chrome.runtime.sendMessage({type: 'RECORD_SKIP', entry})
  } catch {
    // SW may be restarting or context invalidated.
  }
}
