/**
 * Popup UI — Auto Like YT Videos
 *
 * Single-screen scrollable popup. All 7 sections from TRD §2.4:
 *  1. Header (logo + name + version + master pause)
 *  2. Auto-Like Mode selector (4 radio cards)
 *  3. Watch Percentage slider (10%–90%)
 *  4. Whitelist Manager (Add current channel + list)
 *  5. Statistics (total likes counter)
 *  6. Reminders toggle
 *  7. Activity Feed (last 50 log entries)
 */

import {useEffect, useState, useCallback} from 'react'
import type {Settings, Whitelist, Stats, LogEntry, Mode} from '../lib/types'
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

  async function detectActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
      if (!tab?.url || !tab.id) return

      const isYouTube =
        tab.url.includes('youtube.com/watch') || tab.url.includes('youtube.com/shorts/')

      if (!isYouTube) {
        setActiveTabInfo({isYouTube: false, channelName: null, channelId: null, tabId: tab.id})
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
  // Render
  // ---------------------------------------------------------------------------

  const isPaused = settings.is_paused

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

      <div className="popup-body">
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
              {whitelist.channels.map((ch) => (
                <li key={ch.id} className="whitelist-item">
                  <span className="whitelist-icon">📺</span>
                  <span className="whitelist-name">{ch.name}</span>
                  <button
                    className="whitelist-remove"
                    onClick={() => removeChannel(ch.id)}
                    aria-label={`Remove ${ch.name}`}
                    title="Remove from whitelist"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Reminders Toggle ── */}
        <section className="section">
          <h2 className="section-title">Hourly Reminders</h2>
          <label className="toggle-row" htmlFor="reminders-toggle">
            <span className="toggle-label">
              <span className="toggle-icon">🔔</span>
              Show hourly support messages
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
            A friendly message appears every hour of active watch time.
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
