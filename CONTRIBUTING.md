# Contributing

Thanks for helping improve YT AutoLike. This project is a privacy-first
browser extension, so keep changes small, reviewable, and clear about storage
and permission impact.

## Setup

- Use Node.js 24 (`nvm use`) and pnpm 11+.
- Install dependencies with `pnpm install`.
- Run Chrome development mode with `pnpm run dev:chrome`.
- Run Firefox development mode with `pnpm run dev:firefox`.

## Verification

- Lint: `pnpm run lint`
- Typecheck: `pnpm run typecheck`
- Unit tests: `pnpm run test`
- E2E smoke: build Chrome first with `pnpm run build:chrome`, then run `pnpm run test:e2e`
- Full local gate: `pnpm run verify`
- Build all browser artifacts: `pnpm run build:all`

## Browser Extension Debugging

- Chrome: open `chrome://extensions`, enable Developer mode, and load the
  generated `dist/chrome` folder after `pnpm run build:chrome`.
- Firefox: open `about:debugging#/runtime/this-firefox` and load the generated
  `dist/firefox/manifest.json` after `pnpm run build:firefox`.
- Inspect the background service worker from the extension details page.
- Inspect content-script logs from the active YouTube tab DevTools.

## Pull Requests

- Branch from `main` and open the PR against `main`.
- Keep unrelated formatting or dependency churn out of feature PRs.
- Add or update tests for behavior changes.
- Run `pnpm run verify` (includes `format:check`) before requesting review.
- Mention any changes to permissions, storage, privacy behavior, or release
  packaging in the PR description.

## Privacy And Permissions

- Do not add analytics, telemetry, remote code, or hidden network calls.
- Settings and whitelist belong in `chrome.storage.sync`.
- Stats and activity logs belong in `chrome.storage.local`.
- Popup-open state belongs in `chrome.storage.session`.
- Any new permission must be documented in store docs and reviewed in the PR.
