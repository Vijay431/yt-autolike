/**
 * Popup UI — YT AutoLike
 *
 * Single-screen scrollable popup. All sections:
 *  1. Header (logo + name + version + master pause)
 *  2. Login gate — if not logged in, show message and hide everything
 *  3. Now Playing card — current video, time-to-like ETA
 *  4. Auto-Like Mode selector (4 radio cards)
 *  5. Watch Percentage slider (10%–90%)
 *  6. Whitelist Manager (Add current channel + list)
 *  7. Statistics (total likes counter)
 *  8. Reminders toggle (every 15 min)
 *  9. Activity Feed (last 50 log entries)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Zap,
  Film,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  Activity,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { Settings, Whitelist, Stats, Mode, VideoState } from '../lib/types';
import { getSettings, setSettings, getWhitelist, setWhitelist, getStats } from '../lib/storage';
import { DEFAULT_SETTINGS, DEFAULT_WHITELIST, DEFAULT_STATS } from '../lib/storage';

// Extension version (kept in sync with manifest).
const VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// Mode metadata
// ---------------------------------------------------------------------------

const MODES: { value: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'global', label: 'Global', desc: 'All videos & Shorts', icon: <Globe size={20} /> },
  { value: 'only_shorts', label: 'Only Shorts', desc: 'Shorts only', icon: <Zap size={20} /> },
  {
    value: 'only_videos',
    label: 'Only Videos',
    desc: 'Standard videos only',
    icon: <Film size={20} />,
  },
  {
    value: 'whitelist_only',
    label: 'Whitelist Only',
    desc: 'Approved channels only',
    icon: <CheckCircle size={20} />,
  },
];

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

export default function PopupApp() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [whitelist, setWhitelistState] = useState<Whitelist>(DEFAULT_WHITELIST);
  const [stats, setStatsState] = useState<Stats>(DEFAULT_STATS);
  const [activeTabInfo, setActiveTabInfo] = useState<{
    isYouTube: boolean;
    channelName: string | null;
    channelId: string | null;
    tabId: number | null;
  }>({ isYouTube: false, channelName: null, channelId: null, tabId: null });
  const [addChannelStatus, setAddChannelStatus] = useState<string | null>(null);
  // Live video state from the content script
  const [videoState, setVideoState] = useState<VideoState | null>(null);
  const [showPauseOptions, setShowPauseOptions] = useState(false);
  const activeTabIdRef = useRef<number | null>(null);

  // Fetch live video state from the content script.
  // Called immediately after tab detection and then every second.
  const fetchVideoState = useCallback(async (tabId: number) => {
    try {
      const state = await chrome.tabs.sendMessage(tabId, { type: 'GET_VIDEO_STATE' });
      // Only update if we got a real response object back
      if (state && typeof state === 'object') {
        setVideoState(state as VideoState);
      }
    } catch {
      // Content script not ready yet — keep previous state, don't blank it out.
      // videoState will update once the content script responds.
    }
  }, []);

  const detectActiveTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url || !tab.id) return;

      const isYouTube =
        tab.url.includes('youtube.com/watch') || tab.url.includes('youtube.com/shorts/');

      // Always store the tab ID so the polling interval can start sending messages.
      activeTabIdRef.current = tab.id;

      if (!isYouTube) {
        setActiveTabInfo({ isYouTube: false, channelName: null, channelId: null, tabId: tab.id });
        // Still do an immediate fetch — content script reports isVideoPage:false which is correct.
        fetchVideoState(tab.id);
        return;
      }

      // Try to read channel info from the content script.
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CHANNEL_INFO' });
        setActiveTabInfo({
          isYouTube: true,
          channelName: response?.channelName ?? null,
          channelId: response?.channelId ?? null,
          tabId: tab.id,
        });
      } catch {
        setActiveTabInfo({ isYouTube: true, channelName: null, channelId: null, tabId: tab.id });
      }

      // Immediately fetch live video state (don't wait for the 1s interval).
      fetchVideoState(tab.id);
    } catch {
      // Tabs API failure — ignore.
    }
  }, [fetchVideoState]);

  // Load all data on mount.
  useEffect(() => {
    async function load() {
      const [s, w, st] = await Promise.all([getSettings(), getWhitelist(), getStats()]);
      setSettingsState(s);
      setWhitelistState(w);
      setStatsState(st);
    }
    load();

    // Notify background that popup is open.
    chrome.runtime.sendMessage({ type: 'POPUP_OPENED' }).catch(() => {});

    // Detect active tab (YouTube + channel info).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    detectActiveTab();

    // Reload stats periodically while popup is open.
    const refresh = setInterval(() => {
      getStats().then(setStatsState);
    }, 3000);

    return () => {
      clearInterval(refresh);
      chrome.runtime.sendMessage({ type: 'POPUP_CLOSED' }).catch(() => {});
    };
  }, [detectActiveTab]);

  // Poll the content script for live video state every 500 ms.
  // Faster cadence = channel name and ETA update near-instantly.
  useEffect(() => {
    const poll = setInterval(() => {
      const tabId = activeTabIdRef.current;
      if (tabId != null) fetchVideoState(tabId);
    }, 500);
    return () => clearInterval(poll);
  }, [fetchVideoState]);

  // Sync channel info from videoState back into activeTabInfo.
  // Whenever videoState returns a new channelName or channelId, we sync it.
  useEffect(() => {
    if (videoState?.isVideoPage) {
      setActiveTabInfo((prev) => {
        // eslint-disable-line react-hooks/set-state-in-effect
        if (
          prev.channelName === videoState.channelName &&
          prev.channelId === videoState.channelId &&
          prev.isYouTube
        ) {
          return prev;
        }
        return {
          ...prev,
          isYouTube: true,
          channelName: videoState.channelName,
          channelId: videoState.channelId,
        };
      });
    }
  }, [videoState?.isVideoPage, videoState?.channelName, videoState?.channelId]);

  // ---------------------------------------------------------------------------
  // Settings updaters
  // ---------------------------------------------------------------------------

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const updated = { ...settings, ...patch };
      setSettingsState(updated);
      await setSettings(updated);
    },
    [settings],
  );

  // ---------------------------------------------------------------------------
  // Whitelist handlers
  // ---------------------------------------------------------------------------

  async function addCurrentChannel() {
    if (!activeTabInfo.isYouTube) return;

    const name = activeTabInfo.channelName;
    const id = activeTabInfo.channelId;

    if (!name && !id) {
      setAddChannelStatus('Could not detect channel. Make sure you are on a video page.');
      setTimeout(() => setAddChannelStatus(null), 3000);
      return;
    }

    const already = whitelist.channels.some(
      (c) => (id && c.id === id) || (name && c.name.toLowerCase() === name.toLowerCase()),
    );
    if (already) {
      setAddChannelStatus('Channel is already whitelisted.');
      setTimeout(() => setAddChannelStatus(null), 2000);
      return;
    }

    const entry = {
      id: id ?? `name:${name}`,
      name: name ?? id ?? 'Unknown',
      added_at: Date.now(),
    };
    const updated = { channels: [...whitelist.channels, entry] };
    setWhitelistState(updated);
    await setWhitelist(updated);
    setAddChannelStatus(`Added "${entry.name}" to whitelist.`);
    setTimeout(() => setAddChannelStatus(null), 2500);
  }

  async function removeChannel(channelId: string) {
    const updated = { channels: whitelist.channels.filter((c) => c.id !== channelId) };
    setWhitelistState(updated);
    await setWhitelist(updated);
  }

  // ---------------------------------------------------------------------------
  // Derived state helpers
  // ---------------------------------------------------------------------------

  const isPaused =
    settings.is_paused || (settings.pause_until !== null && Date.now() < settings.pause_until);
  const remainingPauseTime =
    settings.pause_until !== null ? Math.max(0, settings.pause_until - Date.now()) : 0;

  // Is the user logged in? (from live video state, or null if unknown)
  const isLoggedIn: boolean | null = videoState ? videoState.isLoggedIn : null;

  // Is the current channel in the whitelist?
  const currentChannelWhitelisted: boolean | null =
    settings.mode === 'whitelist_only' && videoState?.channelName
      ? whitelist.channels.some(
          (c) =>
            (videoState.channelId && c.id === videoState.channelId) ||
            (videoState.channelName &&
              c.name.toLowerCase() === videoState.channelName!.toLowerCase()),
        )
      : null;

  // Time-to-like calculation
  const timeToLike = computeTimeToLike(videoState, settings);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="popup-root">
      {/* ── Header ── */}
      <header className="popup-header">
        <div className="popup-header-left">
          <img
            src={chrome.runtime.getURL('icons/icon-128.png')}
            alt="YT AutoLike Logo"
            className="popup-logo"
            width="32"
            height="32"
          />
          <div>
            <h1 className="popup-title">YT AutoLike</h1>
            <span className="popup-version">v{VERSION}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="master-pause-btn"
          className={`pause-toggle ${isPaused ? 'pause-toggle--paused' : 'pause-toggle--active'}`}
          onClick={() => {
            if (isPaused) {
              updateSettings({ is_paused: false, pause_until: null, pause_duration: null });
              setShowPauseOptions(false);
            } else {
              setShowPauseOptions(!showPauseOptions);
            }
          }}
          aria-label={isPaused ? 'Resume auto-liking' : 'Pause auto-liking'}
          title={isPaused ? 'Click to resume' : 'Click to pause'}
        >
          {isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
        </motion.button>
      </header>

      {/* ── Pause Timer UI ── */}
      <AnimatePresence>
        {!isPaused && showPauseOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pause-quick-controls"
            style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflow: 'hidden' }}
          >
            {[10, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                className="timer-btn"
                onClick={() => {
                  const duration = mins * 60 * 1000;
                  updateSettings({
                    pause_until: Date.now() + duration,
                    pause_duration: duration,
                  });
                  setShowPauseOptions(false);
                }}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {(settings.is_paused || (settings.pause_until !== null && remainingPauseTime > 0)) && (
        <div
          className="paused-banner"
          role="status"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Clock size={16} />
            <span>{settings.is_paused ? 'Auto-liking is paused' : 'Paused for duration'}</span>
          </div>

          {!settings.is_paused && settings.pause_until !== null && (
            <div className="timer-ring-container" style={{ margin: '0 auto' }}>
              <svg className="timer-ring-svg" width="100" height="100">
                <circle className="timer-ring-bg" cx="50" cy="50" r="45" />
                <motion.circle
                  className="timer-ring-progress"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{
                    strokeDashoffset:
                      282.7 * (1 - remainingPauseTime / (settings.pause_duration || 1)),
                  }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </svg>
              <div className="timer-text">{Math.ceil(remainingPauseTime / 60000)}m</div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              updateSettings({ is_paused: false, pause_until: null, pause_duration: null });
              setShowPauseOptions(false);
            }}
            className="timer-cancel-btn"
            style={{ margin: 0 }}
          >
            Resume Now
          </motion.button>
        </div>
      )}

      {/* ── Login Gate ── */}
      {isLoggedIn === false && (
        <div className="login-gate" role="alert">
          <span className="login-gate-icon">🔒</span>
          <div className="login-gate-body">
            <span className="login-gate-title">Not Signed In</span>
            <span className="login-gate-msg">
              Auto-liking only works when you&apos;re logged in to YouTube. Please sign in to your
              Google account.
            </span>
          </div>
        </div>
      )}

      <div className="popup-body">
        {/* ── Now Playing Card ── */}
        <AnimatePresence mode="wait" initial={false}>
          {videoState?.isVideoPage && (
            <motion.section
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="section now-playing-section"
            >
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
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Whitelist mode banner: non-whitelisted channel ── */}
        {settings.mode === 'whitelist_only' &&
          videoState?.isVideoPage &&
          currentChannelWhitelisted === false && (
            <div className="not-whitelisted-banner" role="status">
              🚫 <strong>{videoState.channelName ?? 'This channel'}</strong> is not in your
              whitelist — auto-like will be skipped for this video.
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
            {MODES.map((m) => {
              const isActive = settings.mode === m.value;
              return (
                <motion.button
                  key={m.value}
                  id={`mode-${m.value}`}
                  role="radio"
                  aria-checked={isActive}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mode-card ${isActive ? 'mode-card--active' : ''}`}
                  onClick={() => updateSettings({ mode: m.value })}
                >
                  <span className="mode-icon">{m.icon}</span>
                  <span className="mode-name">{m.label}</span>
                  <span className="mode-desc">{m.desc}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeModeIndicator"
                      className="mode-card-active-bg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
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
              onChange={(e) => updateSettings({ target_percentage: Number(e.target.value) / 100 })}
              aria-label="Watch percentage threshold"
            />
            <span className="slider-bound">90%</span>
          </div>
          <p className="slider-hint">Like triggers when this % of the video is watched.</p>
        </section>

        {/* ── Whitelist Manager ── */}
        <section className="section">
          <div
            className="section-header-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Whitelist
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => chrome.runtime.openOptionsPage()}
              className="manage-whitelist-btn"
            >
              <ExternalLink size={12} />
              Manage
            </motion.button>
          </div>

          <motion.button
            id="add-channel-btn"
            whileHover={activeTabInfo.isYouTube ? { scale: 1.02 } : {}}
            whileTap={activeTabInfo.isYouTube ? { scale: 0.98 } : {}}
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
          </motion.button>

          {addChannelStatus && (
            <p className="channel-status" role="status">
              {addChannelStatus}
            </p>
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
                onChange={(e) => updateSettings({ hourly_reminders_enabled: e.target.checked })}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </div>
          </label>
          <p className="toggle-hint">
            A friendly tip appears every 15 minutes of active watch time.
          </p>
        </section>

        {/* ── Community Support Footer ── */}
        <footer className="popup-footer">
          <p className="community-note">
            🌟 This extension is purely for encouraging community growth. Help creators you love by
            giving them the engagement they deserve!
          </p>
          <div className="footer-links">
            <a
              href="https://github.com/Vijay431/yt-autolike"
              target="_blank"
              rel="noreferrer"
              title="Star on GitHub"
            >
              ⭐ Star
            </a>
            <a
              href="https://github.com/Vijay431/yt-autolike/issues"
              target="_blank"
              rel="noreferrer"
              title="Raise an Issue"
            >
              🛠️ Issue
            </a>
            <a href="mailto:vijayanand431@gmail.com" title="Email for help">
              📧 Help
            </a>
          </div>
          <p className="version-text">YT AutoLike v{VERSION}</p>
        </footer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns seconds of genuine watch time remaining before the auto-like fires.
 * Based on accumulatedWatchSeconds (seek-proof), not the video playhead position.
 * Returns null if duration is unknown. Returns 0 if threshold is already reached.
 */
function computeTimeToLike(videoState: VideoState | null, settings: Settings): number | null {
  if (!videoState?.isVideoPage) return null;
  if (videoState.duration == null) return null;
  const targetSeconds = videoState.duration * settings.target_percentage;
  const remaining = targetSeconds - videoState.accumulatedWatchSeconds;
  return Math.max(0, remaining);
}

/** Format seconds remaining as a human-readable string like "2 min 30 sec" */
function formatMinutes(seconds: number): string {
  const totalSecs = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  if (m === 0) return `${s} sec`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}
