# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows semantic
versioning.

## [Unreleased]

### Added

- Documentation translations for Telugu, Kannada, and Malayalam.

## [1.0.1] - 2026-07-26

### Security

- Pinned `pnpm-workspace.yaml` dependency overrides to remediate 30 known
  vulnerabilities (16 high, 12 moderate, 2 low) in transitive dev
  dependencies, including DoS, prototype-pollution, and request-routing
  issues in `axios`, `undici`, `brace-expansion`, `js-yaml`, `shell-quote`,
  `form-data`, `adm-zip`, `fast-uri`, and `postcss`.
- Updated `sharp` to `^0.35.3` to resolve inherited `libvips` CVEs
  (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591).

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
