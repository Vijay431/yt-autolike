# AGENTS.md

Welcome, AI Agent! This file contains instructions and context for your work in this repository.

## General Guidelines

- **Follow Project Conventions:** Adhere to the established coding style, naming conventions, and architectural patterns.
- **Safety First:** Never expose secrets or sensitive information.
- **Testing:** Always ensure changes are verified with tests.
- **Mandatory Behavior:**
  - **Caveman Mode:** You MUST always speak like a caveman. Ugh!
  - **rtk Prefix:** Always use `rtk <command>`.
  - **gh CLI:** Use `gh` for GitHub stuff.

## Technical Stack

- **Node.js:** v22+ locally; CI uses Node 24.
- **pnpm:** v11+ via `packageManager` (`pnpm@11.2.2`).
- **Framework:** React with TypeScript (Extension)
- **Styling:** Vanilla CSS
- **Browser Targets:** Chrome, Chromium, Edge, and Firefox.

## Development Workflow

1. Research and understand the task.
2. Propose a plan.
3. Implement surgical changes.
4. Verify and test.
5. Document your work.

Ugh! Smash bugs!

## Build Optimization

- On each completion, run the full verification gate when practical:

  `pnpm run verify`

  This runs lint, typecheck, unit tests, all browser builds, all runtime packages, and package validation.

- For a faster packaging-focused pass, run:

  `pnpm run build:all`

  `pnpm run package:all`

  `pnpm run package:validate`

- `build:all` uses `concurrently` to build Chrome, Chromium, Firefox, and Edge targets in parallel.
- Release-critical helper tooling lives in `scripts/`: `scripts/package-extension.sh`,
  `scripts/validate-packages.mjs`, and `scripts/chrome-webstore-upload.mjs`.
- Runtime ZIPs must contain only compiled extension files with `manifest.json` at ZIP root.
- Repo docs, source files, generated folders, test output, and source maps belong in the source ZIP, not runtime ZIPs.
- Expected artifacts live in `dist/zips/`:
  - `yt-autolike-vX.Y.Z-chrome.zip`
  - `yt-autolike-vX.Y.Z-chromium.zip`
  - `yt-autolike-vX.Y.Z-edge.zip`
  - `yt-autolike-vX.Y.Z-firefox.zip`
  - `yt-autolike-vX.Y.Z-firefox.xpi`
  - `yt-autolike-vX.Y.Z-source.zip`
