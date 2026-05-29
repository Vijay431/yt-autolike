# Firefox Add-ons (AMO) Listing — YT AutoLike

> Last Updated: 2026-05-29

Firefox AMO (addons.mozilla.org) uses different submission flows and policies from the Chrome Web Store, but many sections overlap. This document tracks Firefox-specific requirements.

---

## Store Listing

**Add-on Name**
YT AutoLike

**Add-on Slug** *(URL identifier — lowercase, hyphens)*
`auto-like-yt-videos`

**Short Summary** *(max 250 characters)*
Automatically like YouTube videos and Shorts after you've watched a configurable percentage. Four targeting modes, whitelist manager, local-only — no data ever leaves your device.

**Detailed Description** *(plain text — AMO renders basic HTML)*

```
YT AutoLike automatically likes YouTube videos and Shorts once you've watched a customizable percentage of them — helping you support the creators you actually watch.

<b>FEATURES</b>
• Four targeting modes — Global (all videos), Only Shorts, Only Videos, or Whitelist Only (approved channels only)
• Customizable watch threshold — set a trigger from 10% to 90% (default: 50%)
• Whitelist manager — add trusted channels from the popup while watching their videos
• Active-watching guard — only likes when you're actually watching (visible tab or popup open)
• Smart skip logic — skips videos already liked or disliked, and skips if you are logged out
• Total likes counter — see how many videos you've supported
• Hourly reminder toasts — friendly messages every hour of watch time (can be disabled)
• Activity feed — a log of the last 50 auto-like and skip events
• Master pause — pause the extension with one click
• Fully local — all data stays on your device in browser local storage

<b>PRIVACY</b>
No data is transmitted off your device. Settings, whitelist, and activity log are stored exclusively in browser local storage. No analytics, no tracking, no accounts required.

<b>PERMISSIONS</b>
• storage — saves your configuration locally between sessions
• tabs — used by the popup to detect whether you are on a YouTube page
• youtube.com access — required to monitor watch progress and interact with the like button

<b>SUPPORT</b>
Open an issue on the project repository for bugs or feature requests.
```

**Category**
Social & Communication (primary) / Productivity

**Tags** *(max 10)*
youtube, autolike, auto-like, shorts, creator-support, productivity, local, privacy

---

## Firefox-Specific Technical Notes

### Manifest Version
The Firefox build uses Manifest V3 (set via `firefox:manifest_version: 3` in the Extension.js manifest). Firefox 109+ supports MV3.

> ⚠️ **Firefox MV3 Note**: Firefox's MV3 support is still catching up to Chrome's. The Extension.js build handles the compatibility layer. If AMO reviewers flag MV3 issues, consider setting `firefox:manifest_version: 2` in `src/manifest.json` as a fallback (Extension.js will adapt the background script accordingly).

### Background Script
Firefox uses `background.scripts` array instead of `service_worker`. Extension.js handles this via the `firefox:scripts` key in the manifest.

### `browser.*` vs `chrome.*` APIs
Extension.js includes a polyfill that maps `chrome.*` → `browser.*` in Firefox. The background service worker uses `chrome.*` APIs directly; the polyfill handles translation at runtime.

### Temporary Extension ID (for development)
AMO requires a stable extension ID for updates. Add a `browser_specific_settings` entry to `src/manifest.json` for Firefox:

```json
"firefox:browser_specific_settings": {
  "gecko": {
    "id": "auto-like-yt-videos@[your-domain]",
    "strict_min_version": "109.0"
  }
}
```

Replace `[your-domain]` with your actual domain (e.g., `auto-like-yt-videos@vijay.dev`). This must be set **before** your first AMO submission, as it cannot change after the add-on is created.

---

## AMO Review Process

AMO has both automated (machine) and manual human review. Key differences from Chrome Web Store:

| Aspect | Chrome Web Store | Firefox AMO |
|--------|-----------------|-------------|
| Review type | Automated + human | Automated + human (more thorough) |
| First submission | 1–3 business days | Can take 1–2 weeks for human review |
| Source code | Not required | **Required if code is minified/compiled** |
| Updates | Fast (~24 hours) | Faster after initial approval |

### Source Code Submission (AMO Requirement)

Because Extension.js minifies the output, AMO's human reviewers will require the **original source code** as a separate ZIP upload (not included in the extension ZIP).

**How to prepare the source ZIP:**
```bash
zip -r yt-autolike-source-v1.0.0.zip . \
  -x ".git/*" \
  -x "node_modules/*" \
  -x "dist/*" \
  -x "*.zip"
```

Upload this source ZIP in the "Source Code" field during AMO submission. Include a `BUILD.md` or note in the submission comments explaining how to reproduce the build:

```
Build instructions:
1. Install pnpm: npm install -g pnpm
2. Install dependencies: pnpm install
3. Build for Firefox: pnpm build:firefox
4. Output is in dist/firefox/
```

---

## Permissions Justification (AMO Format)

AMO asks for justifications for each permission during the review submission form:

**`storage`**
> The extension stores user settings (auto-like mode, watch threshold, pause state, reminder opt-out), a channel whitelist, a likes counter, accumulated watch time, and an activity log in browser local storage. This data never leaves the device. Without storage, all configuration is lost when the browser is restarted.

**`tabs`**
> The extension popup queries the active tab's URL to determine whether the user is on a YouTube watch or Shorts page. This enables the "Add Current Channel" button in the popup and allows the popup to communicate with the content script to retrieve the current video's channel name. No tab URLs are stored or logged.

**`*://*.youtube.com/*` (host permission)**
> The content script must be injected on YouTube watch pages (`/watch`) and Shorts pages (`/shorts/`). It reads `video.currentTime` and `video.duration` from the HTML5 video element to compute watch progress, checks the like/dislike button DOM state, and clicks the like button when the user's threshold is reached. The extension does not activate on any other website.

---

## Privacy Policy

Same as Chrome Web Store — host `PRIVACY_POLICY.md` at a public URL.

**Privacy Policy URL**: `[FILL IN BEFORE SUBMISSION]`

AMO also accepts a privacy policy entered directly in the submission form. You can paste the contents of `PRIVACY_POLICY.md` there.

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-29 | Initial release | Draft |

---

## AMO Pre-Submission Checklist

- [ ] `browser_specific_settings.gecko.id` set in manifest (Firefox-specific)
- [ ] `strict_min_version` set to `"109.0"` or appropriate minimum
- [ ] Source code ZIP prepared separately for AMO reviewer upload
- [ ] `BUILD.md` or build instructions prepared for AMO reviewer
- [ ] Privacy policy URL live and accessible
- [ ] AMO developer account created at https://addons.mozilla.org/developers/
- [ ] Extension tested in Firefox with `web-ext run` or as a temporary extension
- [ ] No `chrome://` or Chromium-only API calls (Extension.js polyfill handles this)
- [ ] Contact email registered with AMO account

---

## Resources

- [AMO Submission Guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [AMO Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)
- [Firefox MV3 Migration Guide](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/)
- [Source Code Submission](https://extensionworkshop.com/documentation/publish/source-code-submission/)
