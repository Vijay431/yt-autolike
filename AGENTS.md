# AGENTS.md

Instructions for AI coding agents working in this repository. `CLAUDE.md` imports this file.

## Project

YT AutoLike is a privacy-first browser extension (Manifest V3) that auto-likes YouTube videos and
Shorts after a watch threshold. Targets: Chrome, Chromium, Edge, Firefox. No telemetry, no remote
code, no hidden network calls.

## Stack

- **Node.js 24** (strict: `.nvmrc`, `engines.node = 24.x`, `engineStrict` in `pnpm-workspace.yaml`).
- **pnpm 11** via `packageManager`.
- React 19 + TypeScript, built with Extension.js (`extension.config.js`).
- Vanilla CSS, Vitest + Testing Library, Playwright for e2e.
- ESLint 9 flat config (`eslint.config.js`) and Prettier cover every source and doc file.

## Repo map

| Path       | Purpose                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| `src/`     | Extension source: `background.ts`, `content/`, `popup/`, `options/`, `lib/` |
| `tests/`   | Vitest unit tests and Playwright e2e                                        |
| `scripts/` | Packaging, package validation, Chrome Web Store upload, contributor sync    |
| `release/` | Maintainer and store docs (`DEVELOPER.md`, store listings) and store art    |
| `docs/`    | GitHub Pages site (`index.html`, `i18n.js`, `llms.txt`)                     |
| `.github/` | Workflows, CODEOWNERS, Dependabot, issue/PR templates                       |

`scripts/` is reserved by Extension.js; `extension.config.js` strips it from the build entries.
Store art lives in `release/store-assets/`, never in `public/`, so it cannot ship in runtime ZIPs.

## Rules

- Follow existing conventions; keep changes surgical and scoped to the task.
- Never expose secrets. Settings/whitelist live in `chrome.storage.sync`, stats/logs in
  `chrome.storage.local`, popup state in `chrome.storage.session`.
- Any new permission must be documented in `release/CHROMEWEBSTORE.md` and called out in the PR.
- Add or update tests for behavior changes.
- Use Conventional Commits (enforced by commitlint via Husky `commit-msg`).
- Use `gh` for GitHub operations.
- Update `CHANGELOG.md` (Unreleased) for user-visible changes.
- Branch from `main`; open PRs against `main`.

## Verification

Run the full gate before finishing when practical:

```bash
pnpm run verify
```

It runs lint, `format:check`, typecheck, unit tests, all browser builds, packaging, and package
validation. Faster packaging pass: `pnpm run build:all && pnpm run package:all && pnpm run package:validate`.
E2E needs a display: `pnpm run build:chrome && pnpm run test:e2e`.

Runtime ZIPs in `dist/zips/` contain only compiled extension files with `manifest.json` at the root;
docs, source, tests, store art, and source maps belong only in the source ZIP.
