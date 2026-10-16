# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows semantic
versioning.

## [Unreleased]

### Added

- Documentation translations for Telugu, Kannada, and Malayalam.
- Recent Activity feed in the popup showing the latest likes and skips.
- "Celebrate auto-likes" setting to turn the auto-like toast and popup
  confetti on or off.

### Changed

- Popup version label now reads from the extension manifest instead of a
  hardcoded value; the e2e test does the same.
- Reminder comments now describe the 15-minute interval accurately.
- `contributors:sync` now fails instead of overwriting `CONTRIBUTORS.md` when
  the GitHub API is unavailable; pass `--allow-fallback` for offline use.
- Popup ignores auto-like confirmations from invalid senders.

### Fixed

- Already-liked/disliked skips are logged only for videos eligible for
  auto-like, not every video visited.

### Removed

- Unused sidebar and empty content-script stubs, and unused popup CSS.

## [1.0.0] - 2026-06-07

### Added

- Initial YT AutoLike browser extension release.
- Privacy-first local auto-like support for YouTube videos and Shorts.
- Popup settings, whitelist management, stats, and activity feed.
- Chrome, Firefox, and Edge build/package scripts.
- Multi-browser packaging for Chrome, Chromium, Edge, and Firefox, including
  runtime ZIPs and Firefox XPI output.
- Package validation to verify runtime archive contents and source package
  hygiene.
- Chrome Web Store upload helper tooling under `scripts/`.
- CI and release workflow improvements for build, packaging, validation, and
  upload readiness.
- Public browser download links in project documentation.
- CODEOWNERS, cache cleanup automation, and release helper scripts under
  `scripts/`.
- Contributor, security, issue, and pull request documentation.
- Contributor sync automation, contributor credits, and open-source library
  acknowledgements.
- Static documentation site accessibility improvements, language selection
  scaffolding, browser logo cards, and thanks links.
- Full documentation translations for English (US), English (UK), English
  (Global), Tamil, Hindi, and Simplified Chinese, with a roomier language
  dropdown.
- Popup-only confetti for confirmed successful auto-likes.
- Unit-test and verification scripts.
