# Chrome Web Store Listing — YT AutoLike

> Last Updated: 2026-05-29

---

## Store Listing

**Extension Name**
YT AutoLike

**Short Description** *(max 132 characters)*
Automatically like YouTube videos and Shorts after you've watched a set percentage. Fully local — no data leaves your device.

*(Current character count: 131)*

**Detailed Description** *(max 16,000 characters — use plain text, CWS strips markdown)*

```
YT AutoLike automatically likes YouTube videos and Shorts once you've watched a customizable percentage of them — helping you support the creators you actually watch.

FEATURES
• Four targeting modes — Global (all videos), Only Shorts, Only Videos, or Whitelist Only (approved channels only)
• Customizable watch threshold — set a trigger from 10% to 90% (default: 50%)
• Whitelist manager — add trusted channels from the popup while watching their videos
• Active-watching guard — only likes when you're actually watching (visible tab or popup open)
• Smart skip logic — skips videos already liked or disliked, and skips if you are logged out
• Total likes counter — see how many videos you've supported
• Hourly reminder toasts — friendly, non-intrusive messages every hour of watch time (can be turned off)
• Activity feed — a log of the last 50 auto-like and skip events
• Master pause — pause the extension with one click at any time
• Fully local — all data stays on your device; nothing is ever sent to any server

HOW TO USE
1. Click the YT AutoLike icon in the Chrome toolbar to open the popup.
2. Choose your auto-like mode (Global is the default).
3. Adjust the watch threshold slider to your preferred percentage.
4. If using Whitelist Only mode, navigate to a YouTube video and click "Add Current Channel" in the popup.
5. Start watching — the extension handles the rest automatically.

PRIVACY
This extension stores your settings, whitelist, and activity log locally in your browser using chrome.storage.local. No data is ever transmitted to any server. No analytics, no tracking, no cloud sync. See the full privacy policy for details.

PERMISSIONS
• "storage" — saves your settings, whitelist, and activity log locally on your device between browser sessions.
• "tabs" — used only by the popup to detect whether you are on a YouTube page, so the "Add Current Channel" button works correctly.
• Access to youtube.com — required to inject the content script that monitors your watch progress and interacts with the like button. The extension only activates on YouTube watch and Shorts pages.

SUPPORT
Found a bug or have a feature request? Open an issue on the project repository.

Version 1.0.0 — Initial release with all core features: four targeting modes, whitelist manager, watch percentage slider, hourly reminders, activity feed.
```

**Category**
Productivity

**Single Purpose Statement** *(filled in the developer dashboard — not shown to users)*
Automatically likes YouTube videos and Shorts after the user watches a configurable percentage of them.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Notes |
|-------|-----------|--------|-------|
| Store Icon | 128×128 PNG | 🟡 Use existing `src/images/icon.png` (resize to 128×128) | Must be exactly 128×128 |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | Show popup with all 7 sections visible, Global mode active, a few likes recorded |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Not created | Show popup with Whitelist Only mode, whitelist channels populated |
| Screenshot 3 | 1280×800 or 640×400 | ⬜ Not created | Show the hourly reminder toast overlaying a YouTube video |
| Small Promo Tile | 440×280 | ⬜ Not created | Dark background, red accent, extension logo, tagline |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | Optional — only needed for featured placement |

### Screenshot Notes
- Screenshot 1: Load a YouTube video, open the popup. Set mode to Global, slider at 50%. Show the stats counter with a non-zero number. Capture at 1280×800.
- Screenshot 2: Switch to Whitelist Only mode, add 2–3 channels. Show the populated whitelist with delete buttons.
- Screenshot 3: While watching a YouTube video, trigger the hourly toast (temporarily reduce `WATCH_SECONDS_PER_REMINDER` in constants.ts for testing, then revert). Capture the overlay on the video page.

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Saves the user's auto-like mode, watch percentage threshold, pause state, reminder opt-out preference, whitelisted channels, total likes counter, accumulated watch time, and activity log to `chrome.storage.local`. Without this permission, all configuration is lost when the browser session ends. |
| `tabs` | permissions | Used exclusively by the popup UI to query the active tab's URL (`chrome.tabs.query`) to determine whether the user is on a YouTube watch or Shorts page. This enables the "Add Current Channel" button to become active and allows the popup to send a message to the content script to retrieve the current channel name. No tab URLs are stored or transmitted. |
| `*://*.youtube.com/*` | host_permissions | Required to inject the content script on YouTube watch pages (`/watch`) and Shorts pages (`/shorts/`). The content script reads the HTML5 video element's `currentTime` and `duration` to compute watch progress, detects the like/dislike button state via DOM, and performs a click on the like button when the user's threshold is reached. The extension does not operate on any other domain. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes — locally only, on-device.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | N/A | No |
| Health info | No | No | N/A | No |
| Financial info | No | No | N/A | No |
| Authentication info | No | No | N/A | No |
| Personal communications | No | No | N/A | No |
| Location | No | No | N/A | No |
| Web history | No | No | N/A | No |
| User activity | **Yes** — locally only | **No** | Activity log of auto-like/skip events (video title, channel, timestamp) stored in `chrome.storage.local`; displayed in the popup activity feed; capped at 50 entries | No |
| Website content | No | No | N/A | No |

**Additional clarifications for the CWS disclosure form:**
- The extension reads `video.currentTime` and `video.duration` from the YouTube page DOM to compute watch progress. This data is used in memory only and is never stored or transmitted.
- The extension reads channel name and channel ID from the YouTube page DOM only when the user clicks "Add Current Channel" in the popup. This data is stored locally in `chrome.storage.local` only.
- The extension does NOT use `chrome.storage.sync` — data never goes to Google's servers.

### Data Use Certification
- [x] Data is **NOT** sold to third parties
- [x] Data is **NOT** used for purposes unrelated to the extension's core functionality
- [x] Data is **NOT** used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** *(Required — must be publicly hosted before submission)*

> ⚠️ **ACTION REQUIRED**: Host `PRIVACY_POLICY.md` at a public URL before submitting.
>
> **Recommended approach**: Enable GitHub Pages on this repository. The privacy policy will be available at:
> `https://[your-username].github.io/yt-autolike/PRIVACY_POLICY` (or similar).
>
> Alternative: Copy the content into a public GitHub Gist and link to the raw URL.
>
> Once hosted, paste the URL here and in the Chrome Developer Dashboard.

Privacy Policy URL: `[FILL IN BEFORE SUBMISSION]`

---

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

---

## Developer Info

**Publisher Name**: Vijay

**Contact Email**: `[FILL IN — shown publicly on the store listing]`

**Support URL**: `[FILL IN — GitHub Issues page recommended]`

**Homepage URL**: `[FILL IN — GitHub repository URL recommended]`

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-29 | Initial release — four targeting modes, whitelist manager, watch percentage slider, hourly reminder toasts, activity feed, master pause, local-only storage | Draft |

---

## Review Notes

### Known Issues / Limitations

- **YouTube DOM selector brittleness**: YouTube's like button selectors may change over time. The extension uses four fallback strategies per button type for resilience, but may need selector updates if YouTube significantly redesigns its UI. This is documented in `src/content/engine.ts`.
- **Hourly reminder timing**: The 3,600-second accumulator is based on 5-second heartbeat pings during active playback. Pausing the video or switching tabs stops accumulation. The timer is stored in `chrome.storage.local` and persists across page navigations.
- **Login detection**: Relies on detecting the `#avatar-btn` element in YouTube's masthead. If YouTube changes this element, the login check may fall back to "assume logged in."
- **Shorts selector**: Shorts detection relies on the `/shorts/` URL prefix. YouTube's Shorts implementation varies by experiment; the extension has fallback selectors.
- **Google Fonts request**: The popup imports Inter from Google Fonts. This is a standard browser font request, not extension-to-server communication. Declared in the privacy policy.

### Rejection History
*(None yet — first submission)*

---

## Pre-Submission Checklist

Before submitting, verify every item:

**Manifest & Package**
- [x] `manifest_version: 3`
- [x] Version is `1.0.0`
- [x] Name matches this document: "YT AutoLike"
- [x] Description in manifest ≤ 132 chars
- [ ] Build output ZIP contains only compiled files (no source maps, no node_modules)
- [ ] ZIP is under 2GB (expected: ~500KB)

**Permissions**
- [x] Only `storage` and `tabs` permissions requested (minimum required)
- [x] host_permissions scoped to `*://*.youtube.com/*` only (not `<all_urls>`)
- [x] Both permissions justified above
- [x] No unused permissions

**Store Listing**
- [x] Detailed description is specific and function-first
- [x] Single purpose is narrow ("Automatically likes YouTube videos and Shorts after the user watches a configurable percentage of them.")
- [x] No trademark violations (extension name does not claim YouTube affiliation)
- [ ] Contact email filled in
- [ ] Support URL filled in

**Graphics**
- [ ] Store icon: 128×128 PNG
- [ ] At least 1 screenshot at 1280×800

**Privacy & Compliance**
- [x] Data disclosure table is accurate and matches extension code
- [x] No `chrome.storage.sync` used (data stays local)
- [x] No remote code execution
- [x] No obfuscated code (Extension.js minifies, does not obfuscate)
- [ ] Privacy policy URL is live and accessible
- [ ] Privacy policy URL entered in Chrome Developer Dashboard

**Functionality**
- [ ] Extension loaded unpacked in Chrome — all features tested
- [ ] Popup opens without errors
- [ ] Content script injects correctly on YouTube watch pages
- [ ] Content script injects correctly on YouTube Shorts pages
- [ ] Auto-like fires correctly at the configured threshold
- [ ] Whitelist mode correctly restricts to whitelisted channels
- [ ] Hourly reminder toast appears and auto-dismisses
- [ ] Activity feed shows correct entries
- [ ] Master pause correctly stops all auto-like activity
