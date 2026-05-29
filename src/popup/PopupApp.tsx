/**
 * Popup UI — Auto Like YT Videos
 *
 * Single-screen scrollable popup. All sections:
 *  1. Header (logo + name + version + master pause)
 *  2. Login gate — if not logged in, show message and hide everything
 *  3. Now Playing card — current video, progress bar, time-to-like ETA
 *  4. Auto-Like Mode selector (4 radio cards)
 *  5. Watch Percentage slider (10%–90%)
 *  6. Whitelist Manager (Add current channel + list)
 *  7. Statistics (total likes counter)
 *  8. Reminders toggle (every 15 min)
 *  9. Activity Feed (last 50 log entries)
 */

import {useEffect, useState, useCallback, useRef} from 'react'
import type {Settings, Whitelist, Stats, LogEntry, Mode, VideoState} from '../lib/types'
import {
  getSettings,
  setSettings,
  getWhitelist,
  setWhitelist,
  getStats,
  getLogs,
} from '../lib/storage'
import {DEFAULT_SETTINGS, DEFAULT_WHITELIST, DEFAULT_STATS} from '../lib/storage'

// Extension version (kept in sync with manifest).
const VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// Mode metadata
// ---------------------------------------------------------------------------

const MODES: {value: Mode; label: string; desc: string; icon: string}[] = [
  {value: 'global', label: 'Global', desc: 'All videos & Shorts', icon: '🌍'},
  {value: 'only_shorts', label: 'Only Shorts', desc: 'Shorts only', icon: '⚡'},
  {value: 'only_videos', label: 'Only Videos', desc: 'Standard videos only', icon: '🎬'},
  {value: 'whitelist_only', label: 'Whitelist Only', desc: 'Approved channels only', icon: '✅'},
]

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

export default function PopupApp() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [whitelist, setWhitelistState] = useState<Whitelist>(DEFAULT_WHITELIST)
  const [stats, setStatsState] = useState<Stats>(DEFAULT_STATS)
  const [logs, setLogsState] = useState<LogEntry[]>([])
  const [activeTabInfo, setActiveTabInfo] = useState<{
    isYouTube: boolean
    channelName: string | null
    channelId: string | null
    tabId: number | null
  }>({isYouTube: false, channelName: null, channelId: null, tabId: null})
  const [addChannelStatus, setAddChannelStatus] = useState<string | null>(null)
  // Live video state from the content script
  const [videoState, setVideoState] = useState<VideoState | null>(null)
  const activeTabIdRef = useRef<number | null>(null)

  // Load all data on mount.
  useEffect(() => {
    async function load() {
      const [s, w, st, l] = await Promise.all([
        getSettings(),
        getWhitelist(),
        getStats(),
        getLogs(),
      ])
      setSettingsState(s)
      setWhitelistState(w)
      setStatsState(st)
      setLogsState(l)
    }
    load()

    // Notify background that popup is open.
    chrome.runtime.sendMessage({type: 'POPUP_OPENED'}).catch(() => {})

    // Detect active tab (YouTube + channel info).
    detectActiveTab()

    // Reload stats/logs periodically while popup is open.
    const refresh = setInterval(() => {
      getStats().then(setStatsState)
      getLogs().then(setLogsState)
    }, 3000)

    return () => {
      clearInterval(refresh)
      chrome.runtime.sendMessage({type: 'POPUP_CLOSED'}).catch(() => {})
    }
  }, [])

  // Fetch live video state from the content script.
  // Called immediately after tab detection and then every second.
  const fetchVideoState = useCallback(async (tabId: number) => {
    try {
      const state = await chrome.tabs.sendMessage(tabId, {type: 'GET_VIDEO_STATE'})
      // Only update if we got a real response object back
      if (state && typeof state === 'object') {
        setVideoState(state as VideoState)
      }
    } catch {
      // Content script not ready yet — keep previous state, don't blank it out.
      // videoState will update once the content script responds.
    }
  }, [])

  // Poll the content script for live video state every 500 ms.
  // Faster cadence = channel name, progress, and ETA update near-instantly.
  useEffect(() => {
    const poll = setInterval(() => {
      const tabId = activeTabIdRef.current
      if (tabId != null) fetchVideoState(tabId)
    }, 500)
    return () => clearInterval(poll)
  }, [fetchVideoState])

  // Sync channel info from videoState back into activeTabInfo.
  // This is the fast path: if GET_CHANNEL_INFO missed on mount (DOM not ready yet),
  // the 500 ms video-state poll picks up the channel name and feeds it here.
  useEffect(() => {
    if (videoState?.channelName && !activeTabInfo.channelName) {
      setActiveTabInfo((prev) => ({
        ...prev,
        isYouTube: true,
        channelName: videoState.channelName,
        channelId: videoState.channelId,
      }))
    }
  }, [videoState?.channelName, activeTabInfo.channelName])

  async function detectActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
      if (!tab?.url || !tab.id) return

      const isYouTube =
        tab.url.includes('youtube.com/watch') || tab.url.includes('youtube.com/shorts/')

      // Always store the tab ID so the polling interval can start sending messages.
      activeTabIdRef.current = tab.id

      if (!isYouTube) {
        setActiveTabInfo({isYouTube: false, channelName: null, channelId: null, tabId: tab.id})
        // Still do an immediate fetch — content script reports isVideoPage:false which is correct.
        fetchVideoState(tab.id)
        return
      }

      // Try to read channel info from the content script.
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {type: 'GET_CHANNEL_INFO'})
        setActiveTabInfo({
          isYouTube: true,
          channelName: response?.channelName ?? null,
          channelId: response?.channelId ?? null,
          tabId: tab.id,
        })
      } catch {
        setActiveTabInfo({isYouTube: true, channelName: null, channelId: null, tabId: tab.id})
      }

      // Immediately fetch live video state (don't wait for the 1s interval).
      fetchVideoState(tab.id)
    } catch {
      // Tabs API failure — ignore.
    }
  }


  // ---------------------------------------------------------------------------
  // Settings updaters
  // ---------------------------------------------------------------------------

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    const updated = {...settings, ...patch}
    setSettingsState(updated)
    await setSettings(updated)
  }, [settings])

  // ---------------------------------------------------------------------------
  // Whitelist handlers
  // ---------------------------------------------------------------------------

  async function addCurrentChannel() {
    if (!activeTabInfo.isYouTube) return

    const name = activeTabInfo.channelName
    const id = activeTabInfo.channelId

    if (!name && !id) {
      setAddChannelStatus('Could not detect channel. Make sure you are on a video page.')
      setTimeout(() => setAddChannelStatus(null), 3000)
      return
    }

    const already = whitelist.channels.some(
      (c) => (id && c.id === id) || (name && c.name.toLowerCase() === name.toLowerCase()),
    )
    if (already) {
      setAddChannelStatus('Channel is already whitelisted.')
      setTimeout(() => setAddChannelStatus(null), 2000)
      return
    }

    const entry = {
      id: id ?? `name:${name}`,
      name: name ?? id ?? 'Unknown',
      added_at: Date.now(),
    }
    const updated = {channels: [...whitelist.channels, entry]}
    setWhitelistState(updated)
    await setWhitelist(updated)
    setAddChannelStatus(`Added "${entry.name}" to whitelist.`)
    setTimeout(() => setAddChannelStatus(null), 2500)
  }

  async function removeChannel(channelId: string) {
    const updated = {channels: whitelist.channels.filter((c) => c.id !== channelId)}
    setWhitelistState(updated)
    await setWhitelist(updated)
  }

  // ---------------------------------------------------------------------------
  // Derived state helpers
  // ---------------------------------------------------------------------------

  const isPaused = settings.is_paused

  // Is the user logged in? (from live video state, or null if unknown)
  const isLoggedIn: boolean | null = videoState ? videoState.isLoggedIn : null

  // Is the current channel in the whitelist?
  const currentChannelWhitelisted: boolean | null =
    settings.mode === 'whitelist_only' && videoState?.channelName
      ? whitelist.channels.some(
          (c) =>
            (videoState.channelId && c.id === videoState.channelId) ||
            (videoState.channelName &&
              c.name.toLowerCase() === videoState.channelName!.toLowerCase()),
        )
      : null

  // Time-to-like calculation
  const timeToLike = computeTimeToLike(videoState, settings)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="popup-root">
      {/* ── Header ── */}
      <header className="popup-header">
        <div className="popup-header-left">
          <span className="popup-logo">👍</span>
          <div>
            <h1 className="popup-title">Auto Like YT</h1>
            <span className="popup-version">v{VERSION}</span>
          </div>
        </div>
        <button
          id="master-pause-btn"
          className={`pause-toggle ${isPaused ? 'pause-toggle--paused' : 'pause-toggle--active'}`}
          onClick={() => updateSettings({is_paused: !isPaused})}
          aria-label={isPaused ? 'Resume auto-liking' : 'Pause auto-liking'}
          title={isPaused ? 'Click to resume' : 'Click to pause'}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </header>

      {isPaused && (
        <div className="paused-banner" role="status">
          ⏸ Auto-liking is paused
        </div>
      )}

      {/* ── Login Gate ── */}
      {isLoggedIn === false && (
        <div className="login-gate" role="alert">
          <span className="login-gate-icon">🔒</span>
          <div className="login-gate-body">
            <span className="login-gate-title">Not Signed In</span>
            <span className="login-gate-msg">
              Auto-liking only works when you're logged in to YouTube. Please sign in to your Google account.
            </span>
          </div>
        </div>
      )}

      <div className="popup-body">
        {/* ── Now Playing Card ── */}
        {videoState?.isVideoPage && (
          <section className="section now-playing-section">
            <h2 className="section-title">
              <span className="np-dot" aria-hidden="true" />
              Now Playing
            </h2>

            <div className="np-title" title={videoState.title ?? undefined}>
              {videoState.title
                ? videoState.title.length > 52
                  ? videoState.title.slice(0, 52) + '…'
                  : videoState.title
                : 'Loading…'}
            </div>

            {videoState.channelName && (
              <div className="np-channel">
                {videoState.pageType === 'short' ? '⚡' : '🎬'} {videoState.channelName}
                {/* Whitelist mode: flag non-whitelisted channel inline */}
                {settings.mode === 'whitelist_only' && currentChannelWhitelisted === false && (
                  <span className="np-not-whitelisted" title="This channel is not in your whitelist">
                    · Not whitelisted
                  </span>
                )}
                {settings.mode === 'whitelist_only' && currentChannelWhitelisted === true && (
                  <span className="np-is-whitelisted" title="This channel is whitelisted">
                    · ✅ Whitelisted
                  </span>
                )}
              </div>
            )}

            {/* Progress bar — shows actual WATCHED time, not playhead position */}
            {videoState.duration != null && (
              <div className="np-progress-wrap">
                <div
                  className="np-progress-bar"
                  style={{
                    '--watched': `${Math.min(100, (videoState.accumulatedWatchSeconds / videoState.duration) * 100).toFixed(1)}%`,
                    '--position': videoState.currentTime != null
                      ? `${Math.min(100, (videoState.currentTime / videoState.duration) * 100).toFixed(1)}%`
                      : '0%',
                    '--threshold': `${Math.min(100, settings.target_percentage * 100).toFixed(1)}%`,
                  } as React.CSSProperties}
                  role="progressbar"
                  aria-valuenow={Math.round((videoState.accumulatedWatchSeconds / videoState.duration) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Actual watch time progress"
                >
                  {/* White tick showing current playhead position in video */}
                  <div className="np-progress-position" aria-hidden="true" />
                </div>

                <div className="np-progress-labels">
                  <span className="np-progress-watched">
                    ⏱ {formatDuration(videoState.accumulatedWatchSeconds)} watched
                  </span>
                  {videoState.currentTime != null && (
                    <span className="np-progress-dur">
                      ▶ {formatDuration(videoState.currentTime)} / {formatDuration(videoState.duration)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Time to like ETA */}
            <div className="np-eta-row">
              {videoState.alreadyLiked ? (
                <span className="np-eta np-eta--done">✅ Already liked this video</span>
              ) : timeToLike === null ? (
                <span className="np-eta np-eta--unknown">⏳ Waiting for video to load…</span>
              ) : timeToLike <= 0 ? (
                <span className="np-eta np-eta--ready">
                  {settings.is_paused
                    ? '⏸ Auto-like ready (paused)'
                    : settings.mode === 'whitelist_only' && currentChannelWhitelisted === false
                      ? '🚫 Channel not whitelisted — will not auto-like'
                      : '🎯 Threshold reached — auto-liking shortly…'}
                </span>
              ) : (
                <span className="np-eta np-eta--pending">
                  ⏱ {formatMinutes(timeToLike)} to auto-like
                </span>
              )}
            </div>
          </section>
        )}

        {/* ── Whitelist mode banner: non-whitelisted channel ── */}
        {settings.mode === 'whitelist_only' &&
          videoState?.isVideoPage &&
          currentChannelWhitelisted === false && (
            <div className="not-whitelisted-banner" role="status">
              🚫 <strong>{videoState.channelName ?? 'This channel'}</strong> is not in your whitelist
              — auto-like will be skipped for this video.
            </div>
          )}

        {/* ── Stats ── */}
        <section className="section stats-section">
          <div className="stats-counter">
            <span className="stats-number">{stats.total_likes_performed}</span>
            <span className="stats-label">likes done</span>
          </div>
        </section>

        {/* ── Mode Selector ── */}
        <section className="section">
          <h2 className="section-title">Auto-Like Mode</h2>
          <div className="mode-grid" role="radiogroup" aria-label="Auto-like mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                id={`mode-${m.value}`}
                role="radio"
                aria-checked={settings.mode === m.value}
                className={`mode-card ${settings.mode === m.value ? 'mode-card--active' : ''}`}
                onClick={() => updateSettings({mode: m.value})}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-name">{m.label}</span>
                <span className="mode-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Watch Percentage Slider ── */}
        <section className="section">
          <h2 className="section-title">
            Watch Threshold
            <span className="slider-value-badge">
              {Math.round(settings.target_percentage * 100)}%
            </span>
          </h2>
          <div className="slider-container">
            <span className="slider-bound">10%</span>
            <input
              id="watch-percentage-slider"
              type="range"
              className="slider"
              min={10}
              max={90}
              step={5}
              value={Math.round(settings.target_percentage * 100)}
              onChange={(e) => updateSettings({target_percentage: Number(e.target.value) / 100})}
              aria-label="Watch percentage threshold"
            />
            <span className="slider-bound">90%</span>
          </div>
          <p className="slider-hint">Like triggers when this % of the video is watched.</p>
        </section>

        {/* ── Whitelist Manager ── */}
        <section className="section">
          <h2 className="section-title">
            Whitelist
            {whitelist.channels.length > 0 && (
              <span className="count-badge">{whitelist.channels.length}</span>
            )}
          </h2>

          <button
            id="add-channel-btn"
            className={`add-channel-btn ${activeTabInfo.isYouTube ? '' : 'add-channel-btn--disabled'}`}
            onClick={addCurrentChannel}
            disabled={!activeTabInfo.isYouTube}
            title={
              activeTabInfo.isYouTube
                ? activeTabInfo.channelName
                  ? `Add "${activeTabInfo.channelName}"`
                  : 'Add current channel'
                : 'Open a YouTube video to add a channel'
            }
          >
            <span>+</span>
            {activeTabInfo.channelName
              ? `Add "${activeTabInfo.channelName}"`
              : activeTabInfo.isYouTube
                ? 'Add Current Channel'
                : 'Open a YouTube video first'}
          </button>

          {addChannelStatus && (
            <p className="channel-status" role="status">
              {addChannelStatus}
            </p>
          )}

          {whitelist.channels.length === 0 ? (
            <p className="empty-hint">No channels whitelisted yet.</p>
          ) : (
            <ul className="whitelist" aria-label="Whitelisted channels">
              {whitelist.channels.map((ch) => {
                // Mark the currently playing channel in whitelist mode
                const isCurrent =
                  settings.mode === 'whitelist_only' &&
                  videoState?.channelName &&
                  ((videoState.channelId && ch.id === videoState.channelId) ||
                    ch.name.toLowerCase() === (videoState.channelName ?? '').toLowerCase())

                return (
                  <li
                    key={ch.id}
                    className={`whitelist-item ${isCurrent ? 'whitelist-item--current' : ''}`}
                  >
                    <span className="whitelist-icon">📺</span>
                    <span className="whitelist-name">{ch.name}</span>
                    {isCurrent && <span className="whitelist-now">Now Playing</span>}
                    <button
                      className="whitelist-remove"
                      onClick={() => removeChannel(ch.id)}
                      aria-label={`Remove ${ch.name}`}
                      title="Remove from whitelist"
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* ── Reminders Toggle ── */}
        <section className="section">
          <h2 className="section-title">Reminders</h2>
          <label className="toggle-row" htmlFor="reminders-toggle">
            <span className="toggle-label">
              <span className="toggle-icon">🔔</span>
              Show tips every 15 minutes
            </span>
            <div className="toggle-switch-wrapper">
              <input
                id="reminders-toggle"
                type="checkbox"
                className="toggle-input"
                checked={settings.hourly_reminders_enabled}
                onChange={(e) => updateSettings({hourly_reminders_enabled: e.target.checked})}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </div>
          </label>
          <p className="toggle-hint">
            A friendly tip appears every 15 minutes of active watch time.
          </p>
        </section>

        {/* ── Activity Feed ── */}
        <section className="section">
          <h2 className="section-title">
            Activity Feed
            {logs.length > 0 && <span className="count-badge">{logs.length}</span>}
          </h2>

          {logs.length === 0 ? (
            <p className="empty-hint">No activity yet. Start watching a YouTube video!</p>
          ) : (
            <ul className="activity-feed" aria-label="Recent activity">
              {logs.map((log, i) => (
                <li key={i} className={`log-item log-item--${log.status}`}>
                  <span className="log-status-icon">
                    {log.status === 'liked' ? '👍' : log.status === 'skipped' ? '⏭' : '⚠️'}
                  </span>
                  <div className="log-details">
                    <span className="log-title" title={log.title}>
                      {log.title.length > 40 ? log.title.slice(0, 40) + '…' : log.title}
                    </span>
                    <span className="log-meta">
                      {log.channel} · {log.type === 'short' ? '⚡ Short' : '🎬 Video'}
                      {log.reason ? ` · ${log.reason}` : ''}
                    </span>
                  </div>
                  <span className="log-time">{formatTime(log.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(ts: number): string {
  const date = new Date(ts)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Format seconds as mm:ss or h:mm:ss */
function formatDuration(seconds: number): string {
  const s = Math.floor(seconds)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (hh > 0) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
  }
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

/**
 * Returns seconds of genuine watch time remaining before the auto-like fires.
 * Based on accumulatedWatchSeconds (seek-proof), not the video playhead position.
 * Returns null if duration is unknown. Returns 0 if threshold is already reached.
 */
function computeTimeToLike(videoState: VideoState | null, settings: Settings): number | null {
  if (!videoState?.isVideoPage) return null
  if (videoState.duration == null) return null
  const targetSeconds = videoState.duration * settings.target_percentage
  const remaining = targetSeconds - videoState.accumulatedWatchSeconds
  return Math.max(0, remaining)
}

/** Format seconds remaining as a human-readable string like "2 min 30 sec" */
function formatMinutes(seconds: number): string {
  const totalSecs = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  if (m === 0) return `${s} sec`
  if (s === 0) return `${m} min`
  return `${m} min ${s} sec`
}
