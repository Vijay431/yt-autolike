# Developer Guide & Release Pipeline Setup

This guide documents how to configure and use the automated release pipeline to publish the YT AutoLike extension to the Chrome Web Store and attach browser builds to GitHub releases.

---

## GitHub Actions Secret Configuration

The release workflow requires four repository secrets configured under **Settings** > **Secrets and variables** > **Actions**:

| Secret Name            | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `CHROME_EXTENSION_ID`  | The 32-character ID of the extension on the Chrome Developer Dashboard. |
| `CHROME_CLIENT_ID`     | Google OAuth2 Client ID from the Google Cloud Console.                  |
| `CHROME_CLIENT_SECRET` | Google OAuth2 Client Secret from the Google Cloud Console.              |
| `CHROME_REFRESH_TOKEN` | OAuth2 Refresh Token used to authorize the publishing API.              |

---

## Step-by-Step Credentials Acquisition Guide

### 1. Retrieve the `CHROME_EXTENSION_ID`

1. Go to the [Chrome Developer Dashboard](https://developer.chrome.com/dashboard).
2. Register your developer account if you haven't already.
3. Upload `dist/zips/yt-autolike-vX.Y.Z-chrome.zip` manually for the first time to create a draft listing.
4. Locate the 32-character extension ID on your dashboard list or in the dashboard URL.

### 2. Generate `CHROME_CLIENT_ID` and `CHROME_CLIENT_SECRET`

1. Open the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (e.g., `YT AutoLike Publisher`).
3. Search for the **Chrome Web Store API** in the API Library and **Enable** it.
4. Navigate to the **OAuth consent screen** on the left menu:
   - Select **External** user type.
   - Complete the app details and developer email.
   - Under **Scopes**, add `https://www.googleapis.com/auth/chromewebstore`.
   - Under **Test Users**, add the Google email account you use to log into the Developer Dashboard.
5. Navigate to **Credentials** on the left menu:
   - Click **Create Credentials** > **OAuth client ID**.
   - Select application type: **Desktop app**.
   - Save to view and copy your **Client ID** and **Client Secret**.

### 3. Generate `CHROME_REFRESH_TOKEN`

Since the GitHub pipeline runs headless, it needs a refresh token to request temporary access tokens.

1. Construct the following authorization URL by replacing `<YOUR_CLIENT_ID>` with the Client ID you generated:
   ```text
   https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=<YOUR_CLIENT_ID>&redirect_uri=https://oauth2.googleapis.com/tokeninfo&scope=https://www.googleapis.com/auth/chromewebstore&access_type=offline&prompt=consent
   ```
2. Open this URL in your browser and authorize it using the Google account registered as a Test User.
3. The page will redirect (it may show a token info screen or redirect to an invalid URL). Copy the code parameter (`?code=...`) from the browser's address bar.
4. Open your terminal and exchange this authorization code for the refresh token using `curl`:
   ```bash
   curl -X POST \
     -d "client_id=<YOUR_CLIENT_ID>" \
     -d "client_secret=<YOUR_CLIENT_SECRET>" \
     -d "code=<AUTHORIZATION_CODE>" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=https://oauth2.googleapis.com/tokeninfo" \
     https://oauth2.googleapis.com/token
   ```
5. The JSON response will contain a `"refresh_token"`. Copy its value (this token does not expire unless revoked).

---

## Local Packaging and Verification

To manually build, package, and validate the extension files locally:

```bash
pnpm run build:all
pnpm run package:all
pnpm run package:validate
```

`pnpm run verify` runs lint, typecheck, unit tests, all browser builds, all packages, and package validation.

Output files are written to `./dist/zips/`:

- `yt-autolike-vX.Y.Z-chrome.zip`
- `yt-autolike-vX.Y.Z-chromium.zip`
- `yt-autolike-vX.Y.Z-edge.zip`
- `yt-autolike-vX.Y.Z-firefox.zip`
- `yt-autolike-vX.Y.Z-firefox.xpi`
- `yt-autolike-vX.Y.Z-source.zip`

Runtime ZIPs contain only compiled extension files with `manifest.json` at the ZIP root. Repository docs, source files, generated folders, test outputs, and source maps are excluded from browser runtime ZIPs. The source ZIP is built from tracked source files for AMO review.

---

## Pipeline Execution Flow

1. Draft a release on GitHub.
2. Publish the release.
3. The `release` workflow will trigger automatically:
   - Check out the codebase, setup node, and install dependencies.
   - Run `pnpm run verify` to build, package, and validate browser targets.
   - Upload the ZIP archives as assets directly to the GitHub release using `gh release`.
   - Deploy the Chrome ZIP package directly to the Chrome Web Store using Google APIs.
