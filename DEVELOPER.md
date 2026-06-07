# Developer Guide & Release Pipeline Setup

This guide documents how to configure and use the release pipeline for YT AutoLike. The workflow builds browser packages, attaches them to a GitHub release, and uploads the Chrome ZIP to the Chrome Developer Dashboard. It does not submit the item for review automatically.

---

## GitHub Actions Secret Configuration

The release workflow requires these repository secrets under **Settings** > **Secrets and variables** > **Actions**:

| Secret Name                       | Description                                                                |
| --------------------------------- | -------------------------------------------------------------------------- |
| `RELEASE_WORKFLOW_ALLOWED_ACTORS` | Comma-separated GitHub usernames allowed to run manual release dispatches. |
| `CHROME_PUBLISHER_ID`             | Publisher ID from the Chrome Developer Dashboard account URL/API setup.    |
| `CHROME_EXTENSION_ID`             | The 32-character ID of the extension on the Chrome Developer Dashboard.    |
| `CHROME_CLIENT_ID`                | Google OAuth2 Client ID from the Google Cloud Console.                     |
| `CHROME_CLIENT_SECRET`            | Google OAuth2 Client Secret from the Google Cloud Console.                 |
| `CHROME_REFRESH_TOKEN`            | OAuth2 Refresh Token used to authorize the Chrome Web Store API.           |

---

## Chrome Web Store Setup

### 1. Prepare the Dashboard Listing

1. Go to the [Chrome Developer Dashboard](https://developer.chrome.com/dashboard).
2. Register or select the publisher account that owns YT AutoLike.
3. Create the item and complete the first listing, privacy, category, screenshots, and policy fields in the dashboard.
4. Upload `dist/zips/yt-autolike-vX.Y.Z-chrome.zip` manually the first time if needed to create the draft item.
5. Copy the 32-character item ID into `CHROME_EXTENSION_ID`.
6. Copy the publisher ID for the owning publisher account into `CHROME_PUBLISHER_ID`.

The Chrome Web Store requires the uploaded manifest version to increase for each new package. First-time listing and privacy setup remain dashboard work.

### 2. Create OAuth Credentials

1. Open the [Google Cloud Console](https://console.cloud.google.com).
2. Create or select a project for release automation.
3. Enable the **Chrome Web Store API**.
4. Configure the OAuth consent screen.
5. Add the Chrome Web Store scope:
   ```text
   https://www.googleapis.com/auth/chromewebstore
   ```
6. Add the Google account that owns or manages the Chrome Developer Dashboard publisher as a test user if the app is in testing.
7. Create an OAuth client ID for a **Desktop app**.
8. Save the generated client ID and client secret as `CHROME_CLIENT_ID` and `CHROME_CLIENT_SECRET`.

### 3. Generate `CHROME_REFRESH_TOKEN`

Use OAuth Playground with the same Google account that can manage the Chrome Web Store item:

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Click the settings icon.
3. Enable **Use your own OAuth credentials**.
4. Enter `CHROME_CLIENT_ID` and `CHROME_CLIENT_SECRET`.
5. In the scope box, enter:
   ```text
   https://www.googleapis.com/auth/chromewebstore
   ```
6. Authorize the API and exchange the authorization code for tokens.
7. Copy the refresh token into the `CHROME_REFRESH_TOKEN` GitHub secret.

---

## Local Packaging and Verification

To manually build, package, and validate the extension files locally:

```bash
pnpm run build:all
pnpm run package:all
pnpm run package:validate
```

`pnpm run verify` runs lint, typecheck, unit tests, all browser builds, all packages, and package validation.

Release helper scripts live in `scripts/`: `scripts/package-extension.sh`,
`scripts/validate-packages.mjs`, and `scripts/chrome-webstore-upload.mjs`. Use the `pnpm`
commands above as the public interface so local usage and CI stay aligned.

Output files are written to `./dist/zips/`:

- `yt-autolike-vX.Y.Z-chrome.zip`
- `yt-autolike-vX.Y.Z-chromium.zip`
- `yt-autolike-vX.Y.Z-edge.zip`
- `yt-autolike-vX.Y.Z-firefox.zip`
- `yt-autolike-vX.Y.Z-firefox.xpi`
- `yt-autolike-vX.Y.Z-source.zip`

Runtime ZIPs contain only compiled extension files with `manifest.json` at the ZIP root. Repository docs, source files, generated folders, test outputs, and source maps are excluded from browser runtime ZIPs. The source ZIP is built from tracked source files for AMO review.

To dry-run the Chrome upload script without secrets or API calls:

```bash
pnpm run chrome-webstore:upload -- --zip dist/zips/yt-autolike-v1.0.0-chrome.zip --dry-run
```

---

## Pipeline Execution Flow

1. Create a draft GitHub release for the target tag.
2. Publish the GitHub release. Draft releases do not run the workflow.
3. The `Release and Publish` workflow checks out the release tag, updates local build metadata to the tag version, runs `pnpm run verify`, and uploads the packaged artifacts as a workflow artifact.
4. Downstream jobs run in parallel:
   - GitHub release upload attaches all versioned ZIP/XPI/source artifacts plus stable latest-download aliases.
   - Chrome Web Store upload sends the versioned Chrome ZIP to Chrome Web Store API v2.
   - Firefox AMO and Edge Add-ons jobs stay visible but are intentionally skipped until marketplace accounts exist.
5. Open the Chrome Developer Dashboard, review the uploaded draft package and listing state, then manually submit it for review.

The automation only calls the API v2 upload and status endpoints. It does not call the publish endpoint, so review submission stays manual.

Manual `workflow_dispatch` is available for recovery runs. The actor must be listed in `RELEASE_WORKFLOW_ALLOWED_ACTORS`, and the requested `tag_name` is checked out before build and upload.
