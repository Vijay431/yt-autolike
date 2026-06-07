# Contributing

Thanks for helping improve YT AutoLike. This project is a privacy-first
browser extension, so keep changes small, reviewable, and clear about storage
and permission impact.

## Setup

- Use Node.js 22+ and pnpm 11+.
- Install dependencies with `rtk pnpm install`.
- Run Chrome development mode with `rtk pnpm run dev:chrome`.
- Run Firefox development mode with `rtk pnpm run dev:firefox`.

## Verification

- Lint: `rtk pnpm run lint`
- Typecheck: `rtk pnpm run typecheck`
- Unit tests: `rtk pnpm run test`
- E2E smoke: build Chrome first with `rtk pnpm run build:chrome`, then run `rtk pnpm run test:e2e`
- Full local gate: `rtk pnpm run verify`
- Build all browser artifacts: `rtk pnpm run build:all`

## Browser Extension Debugging

- Chrome: open `chrome://extensions`, enable Developer mode, and load the
  generated `dist/chrome` folder after `rtk pnpm run build:chrome`.
- Firefox: open `about:debugging#/runtime/this-firefox` and load the generated
  `dist/firefox/manifest.json` after `rtk pnpm run build:firefox`.
- Inspect the background service worker from the extension details page.
- Inspect content-script logs from the active YouTube tab DevTools.

## Pull Requests

- Branch from `dev`.
- Keep unrelated formatting or dependency churn out of feature PRs.
- Add or update tests for behavior changes.
- Run `rtk pnpm run verify` before requesting review.
- Mention any changes to permissions, storage, privacy behavior, or release
  packaging in the PR description.

## Privacy And Permissions

- Do not add analytics, telemetry, remote code, or hidden network calls.
- Settings and whitelist belong in `chrome.storage.sync`.
- Stats and activity logs belong in `chrome.storage.local`.
- Popup-open state belongs in `chrome.storage.session`.
- Any new permission must be documented in store docs and reviewed in the PR.
