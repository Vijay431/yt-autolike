#!/usr/bin/env bash
# =============================================================================
# package-extension.sh
# Creates clean distribution ZIPs from the Extension.js build output for
# Chrome Web Store, Edge Add-ons, and Firefox AMO submission.
#
# Usage:
#   chmod +x package-extension.sh
#   ./package-extension.sh [chrome|edge|firefox|all]
#
# Output: dist/zips/yt-autolike-v1.0.0-chrome.zip (and edge, firefox)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
EXTENSION_NAME="yt-autolike"
VERSION="1.0.0"  # Keep in sync with manifest.json
DIST_DIR="./dist"
OUT_DIR="./dist/zips"

# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
build_browser() {
  local browser="$1"
  local browser_dist="${DIST_DIR}/${browser}"
  local output="${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-${browser}.zip"

  info "Building ${browser} extension..."
  pnpm build --browser "${browser}" || error "Build failed for ${browser}"

  if [[ ! -d "$browser_dist" ]]; then
    error "Build output directory not found: ${browser_dist}"
  fi

  mkdir -p "$OUT_DIR"
  rm -f "$output"

  info "Packaging ${browser} → ${output}"
  (
    cd "$browser_dist"
    zip -r "../../zips/${EXTENSION_NAME}-v${VERSION}-${browser}.zip" . \
      -x "*.map" \
      -x ".DS_Store" \
      -x "Thumbs.db" \
      -x "__MACOSX/*"
  )

  local size
  size=$(du -sh "$output" | cut -f1)
  info "✅ ${browser}: ${output} (${size})"
}

package_source() {
  local output="${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-source.zip"
  info "Packaging source code (required for Firefox AMO)..."
  mkdir -p "$OUT_DIR"
  rm -f "$output"

  zip -r "$output" . \
    -x ".git/*" \
    -x "node_modules/*" \
    -x "dist/*" \
    -x "*.zip" \
    -x ".DS_Store" \
    -x "Thumbs.db" \
    -x "__MACOSX/*" \
    -x ".antigravitycli/*"

  local size
  size=$(du -sh "$output" | cut -f1)
  info "✅ Source ZIP: ${output} (${size})"
  echo ""
  warn "Firefox AMO requires this source ZIP to be uploaded separately during submission."
  warn "Include these build instructions in the AMO submission notes:"
  echo "  1. npm install -g pnpm"
  echo "  2. pnpm install"
  echo "  3. pnpm build:firefox"
  echo "  4. Output: dist/firefox/"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
TARGET="${1:-all}"

case "$TARGET" in
  chrome)
    build_browser "chrome"
    ;;
  edge)
    build_browser "edge"
    ;;
  firefox)
    build_browser "firefox"
    package_source
    ;;
  all)
    info "Building all three browser targets..."
    build_browser "chrome"
    build_browser "edge"
    build_browser "firefox"
    package_source
    echo ""
    info "All packages ready in ${OUT_DIR}/"
    ls -lh "${OUT_DIR}/"
    ;;
  *)
    error "Unknown target '${TARGET}'. Use: chrome | edge | firefox | all"
    ;;
esac
