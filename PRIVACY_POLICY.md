# Privacy Policy — YT AutoLike

**Last Updated: 2026-05-29**

---

## Overview

YT AutoLike is a browser extension that automatically likes YouTube videos and Shorts after you have watched a customizable percentage of them. It is designed with a strict local-only data posture: **no data ever leaves your device**, and **no third-party services are used**.

---

## 1. What Data Is Collected

The extension collects and stores only the minimum data required for its features to work. All data is stored exclusively in your browser's local storage (`chrome.storage.local`) and never transmitted off your device.

| Data Type | Collected? | What It Is | Purpose |
|-----------|-----------|------------|---------|
| Settings preferences | **Yes — local/sync** | Your chosen auto-like mode, watch percentage threshold, pause state, and reminder opt-out preference | Persist your configuration between browser sessions and across devices (via Chrome Sync) |
| Whitelisted YouTube channels | **Yes — local/sync** | Channel IDs and display names you explicitly add to the whitelist | Determine which channels to auto-like in Whitelist-Only mode across your devices |
| Like activity statistics | **Yes — local only** | A running total count of auto-likes performed and your cumulative active watch time in seconds | Display your total likes counter in the popup UI; trigger the hourly reminder |
| Activity log entries | **Yes — local only** | Video title, channel name, content type (video or Short), action status (liked/skipped/error), and timestamp for up to 50 recent actions | Display the recent activity feed in the popup UI |

**Data NOT collected:**
- Your Google account credentials or authentication tokens
- Your browsing history outside of YouTube watch/Shorts pages
- Your location, IP address, or device identifiers
- Video playback data beyond what is needed to compute watch percentage (`currentTime / duration`)
- Any personally identifiable information

---

## 2. How Data Is Stored

The extension uses the standard Chrome Storage APIs to keep your data safe and private.

- **Settings & Whitelist:** Stored in `chrome.storage.sync`. If you are signed in to your browser with sync enabled, this data may be synced across your devices. This data is private to your account and is never shared with us or any third parties.
- **Statistics & Activity Logs:** Stored in `chrome.storage.local`. This data remains on your current device only.
- **No external servers:** The extension makes no outbound network requests of any kind (other than what the browser itself does for sync).
- **Retention:** Data remains until you clear it manually or uninstall the extension.

---

## 3. How Data Is Used

Each data item is used exclusively for its declared purpose:

- **Settings** → Applied by the content script each time you watch a YouTube video to determine whether and when to auto-like.
- **Whitelist** → Checked against the current video's channel when operating in "Whitelist Only" mode.
- **Statistics** → Displayed in the extension popup; used to trigger the hourly reminder toast.
- **Activity log** → Displayed in the extension popup's activity feed.

---

## 4. Permissions Explanation

The extension requests the following browser permissions:

### `storage`
Used to read and write your data. `chrome.storage.sync` is used for settings/whitelist (to follow you across devices), and `chrome.storage.local` is used for logs/stats (device-specific).

### `tabs`
Used exclusively by the popup UI to detect whether you are on YouTube so it can show appropriate controls.

### Host permission: `*://*.youtube.com/*`
Required to inject the content script on YouTube pages. The content script monitors the HTML5 video element's `currentTime` and `duration` properties to compute your watch progress, and interacts with YouTube's like button DOM element when the threshold is reached. The extension operates **only** on `youtube.com` — no other websites.

---

## 5. Third-Party Services

**None.** This extension does not use any third-party services, APIs, analytics platforms, crash reporters, or advertising networks. There are no external dependencies that receive data.

The popup UI imports the [Inter](https://fonts.google.com/specimen/Inter) font from Google Fonts via CSS `@import`. This causes your browser to make a request to `fonts.googleapis.com` when the popup is opened, which is standard browser behaviour. Google's [privacy policy](https://policies.google.com/privacy) governs that request. If you prefer to avoid this, you may use a forked build with the font import removed.

---

## 6. Data Sharing

Your data is **not shared with any third parties**, period. There are no analytics providers, advertisers, partners, or any other entities that receive data from this extension.

Certification:
- ✅ Data is **NOT** sold to third parties
- ✅ Data is **NOT** used for purposes unrelated to the extension's core functionality
- ✅ Data is **NOT** used for creditworthiness or lending purposes

---

## 7. User Controls & Data Deletion

You have full control over all data stored by the extension:

- **Settings & whitelist:** Editable at any time via the extension popup
- **Clear all data:** Uninstalling the extension removes all stored data. You can also clear the data manually via your browser's extension settings (Chrome: `chrome://settings/content/all` → site data for the extension)
- **Activity log:** The log is automatically capped at 50 entries; older entries are discarded automatically

There is no account to delete and no server-side data to request removal of.

---

## 8. Children's Privacy

This extension is not directed at children under the age of 13. We do not knowingly collect any data from children. The extension operates on YouTube, which has its own age restrictions and privacy practices.

---

## 9. Changes to This Policy

If the extension's data practices change in a future version, this privacy policy will be updated and the "Last Updated" date at the top of this document will be revised. Significant changes will be noted in the extension's version changelog.

---

## 10. Contact

For privacy questions, concerns, or data deletion requests, please open an issue on the project repository or contact the developer directly.

> This privacy policy applies to the "YT AutoLike" browser extension version 1.0.0 and above.
