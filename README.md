# YT AutoLike

A cross-browser extension built with [Extension.js](https://extension.js.org) that automatically likes YouTube videos and Shorts after you've watched a customizable percentage of them. Supports Chrome, Edge, and Firefox.

**All data stays fully local — nothing ever leaves your device.**

---

## Features

- **Four targeting modes** — Global, Only Shorts, Only Videos, Whitelist Only
- **Configurable watch threshold** — 10%–90% (default 50%)
- **Whitelist manager** — Add trusted channels from the popup
- **Active-watching guard** — Only acts on visible tabs
- **Skip logic** — Skips already-liked/disliked videos and logged-out state
- **Hourly reminder toasts** — Friendly messages every hour of watch time (opt-out available)
- **Total likes counter** — Track how many videos you've supported
- **Activity feed** — Last 50 auto-like/skip events
- **Master pause** — Pause with one click

---

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode (Chrome)
pnpm dev

# Build for a specific browser
pnpm build:chrome
pnpm build:edge
pnpm build:firefox
```

---

## Project Docs

| Document | Purpose |
|----------|---------|
| [`project-docs/prd.md`](project-docs/prd.md) | Product Requirements Document |
| [`project-docs/trd.md`](project-docs/trd.md) | Technical Requirements Document |
| [`project-docs/discussion.md`](project-docs/discussion.md) | Design decisions log |

---

## Publishing Docs

| Document | Purpose |
|----------|---------|
| [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) | Full privacy policy (host publicly before submitting) |
| [`CHROMEWEBSTORE.md`](CHROMEWEBSTORE.md) | Chrome Web Store listing, permissions justification, submission checklist |
| [`FIREFOX_AMO.md`](FIREFOX_AMO.md) | Firefox AMO listing, source code submission instructions |
| [`package-extension.sh`](package-extension.sh) | Script to build and zip all three browser packages |

---

## Privacy

This extension stores your settings, whitelist, and activity log locally in `chrome.storage.local`. No data is transmitted to any server. See [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) for the full policy.

---

## Architecture

```
src/
├── manifest.json          # Extension.js manifest (cross-browser prefixed keys)
├── background.ts          # Service worker: watch timer, stats writer, popup state
├── lib/
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── storage.ts         # Typed chrome.storage.local wrappers
│   ├── messages.ts        # 100 positive reminder messages pool
│   └── constants.ts       # Extension-wide constants
├── content/
│   ├── scripts.ts         # Content script entrypoint
│   ├── engine.ts          # Auto-like engine (core logic)
│   └── toast.ts           # Hourly reminder toast overlay
└── popup/
    ├── index.html         # Popup HTML shell
    ├── scripts.tsx        # React mount entrypoint
    ├── PopupApp.tsx       # Full popup UI (7 sections)
    └── styles.css         # Premium dark UI styles
```
