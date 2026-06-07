#!/usr/bin/env bash
# =============================================================================
# package-extension.sh
# Creates clean distribution ZIPs from the Extension.js build output for
# Chrome Web Store, Edge Add-ons, and Firefox AMO submission.
#
# Usage:
#   chmod +x package-extension.sh
#   ./package-extension.sh [chrome|chromium|edge|firefox|all|from-dist]
#
# Output: dist/zips/yt-autolike-v1.0.0-chrome.zip (and chromium, edge, firefox)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
EXTENSION_NAME="yt-autolike"
VERSION=$(node -e "console.log(require('./package.json').version)")
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

  info "Building ${browser} extension..."
  pnpm run "build:${browser}" || error "Build failed for ${browser}"

  package_browser_dist "$browser" "$browser_dist"
}

package_browser_dist() {
  local browser="$1"
  local browser_dist="$2"
  local output="${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-${browser}.zip"

  if [[ ! -d "$browser_dist" ]]; then
    error "Build output directory not found: ${browser_dist}"
  fi

  mkdir -p "$OUT_DIR"
  rm -f "$output"

  info "Packaging ${browser} → ${output}"
  (
    cd "$browser_dist"
    zip -r "../zips/${EXTENSION_NAME}-v${VERSION}-${browser}.zip" . \
      -x "*.map" \
      -x ".DS_Store" \
      -x "Thumbs.db" \
      -x "__MACOSX/*" \
      -x "screenshot.png" \
      -x "images/*"
  )

  local size
  size=$(du -sh "$output" | cut -f1)
  info "✅ ${browser}: ${output} (${size})"

  if [[ "$browser" == "firefox" ]]; then
    local xpi_output="${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-firefox.xpi"
    cp "$output" "$xpi_output"
    local xpi_size
    xpi_size=$(du -sh "$xpi_output" | cut -f1)
    info "✅ Firefox XPI: ${xpi_output} (${xpi_size})"
  fi
}

package_source() {
  local output="${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-source.zip"
  local file_list
  info "Packaging source code (required for Firefox AMO)..."
  mkdir -p "$OUT_DIR"
  rm -f "$output"
  file_list=$(mktemp)
  git ls-files \
    | grep -Ev '(^|/)(dist|node_modules|coverage|playwright-report|test-results|graphify-out|\.agent|\.agents|\.antigravitycli|\.claude|\.codegraph|\.codex|\.gemini)(/|$)' \
    > "$file_list"

  zip -q "$output" -@ < "$file_list"
  rm -f "$file_list"

  local size
  size=$(du -sh "$output" | cut -f1)
  info "✅ Source ZIP: ${output} (${size})"
  echo ""
  warn "Firefox AMO requires this source ZIP to be uploaded separately during submission."
  warn "Include these build instructions in the AMO submission notes:"
  echo "  1. npm install -g pnpm"
  echo "  2. pnpm install --frozen-lockfile"
  echo "  3. pnpm run build:firefox"
  echo "  4. Output: dist/firefox/"
}

# ---------------------------------------------------------------------------
# Manual Installation Guide
# ---------------------------------------------------------------------------
print_manual_install_instructions() {
  local target="$1"
  echo -e "\n============================================================================="
  echo -e "${YELLOW}MANUAL INSTALLATION / TESTING INSTRUCTIONS${NC}"
  echo -e "============================================================================="

  if [[ "$target" == "chromium" || "$target" == "all" ]]; then
    echo -e "\n${GREEN}Chromium / Google Chrome:${NC}"
    echo -e "  1. Open Chrome/Chromium and navigate to: ${YELLOW}chrome://extensions${NC}"
    echo -e "  2. Enable ${YELLOW}Developer mode${NC} (toggle switch in top-right)."
    echo -e "  3. Click ${YELLOW}Load unpacked${NC}."
    echo -e "  4. Select the build directory: ${YELLOW}${DIST_DIR}/chromium${NC} (or ${YELLOW}${DIST_DIR}/chrome${NC})"
    echo -e "     (Or unzip ${YELLOW}${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-chromium.zip${NC} and load that folder)"
  fi

  if [[ "$target" == "edge" || "$target" == "all" ]]; then
    echo -e "\n${GREEN}Microsoft Edge:${NC}"
    echo -e "  1. Open Microsoft Edge and navigate to: ${YELLOW}edge://extensions${NC}"
    echo -e "  2. Enable ${YELLOW}Developer mode${NC} (toggle switch in bottom-left/top-right)."
    echo -e "  3. Click ${YELLOW}Load unpacked${NC}."
    echo -e "  4. Select the build directory: ${YELLOW}${DIST_DIR}/edge${NC}"
    echo -e "     (Or unzip ${YELLOW}${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-edge.zip${NC} and load that folder)"
  fi

  if [[ "$target" == "firefox" || "$target" == "all" ]]; then
    echo -e "\n${GREEN}Mozilla Firefox:${NC}"
    echo -e "  ${YELLOW}Option A: Temporary Installation (Runs until Firefox restarts)${NC}"
    echo -e "    1. Open Firefox and navigate to: ${YELLOW}about:debugging#/runtime/this-firefox${NC}"
    echo -e "    2. Click ${YELLOW}Load Temporary Add-on...${NC}"
    echo -e "    3. Select ${YELLOW}manifest.json${NC} in the folder: ${YELLOW}${DIST_DIR}/firefox/${NC}"
    echo -e "       (Or select the ZIP: ${YELLOW}${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-firefox.zip${NC})"
    echo -e "  ${YELLOW}Option B: Permanent Installation (Firefox Developer / Nightly / ESR only)${NC}"
    echo -e "    1. Navigate to ${YELLOW}about:config${NC} and search for ${YELLOW}xpinstall.signatures.required${NC}"
    echo -e "    2. Double-click to set it to ${YELLOW}false${NC}."
    echo -e "    3. Navigate to ${YELLOW}about:addons${NC}."
    echo -e "    4. Drag and drop the XPI file: ${YELLOW}${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-firefox.xpi${NC}"
    echo -e "       (Or click the gear icon and select ${YELLOW}Install Add-on From File...${NC})"
  fi
  echo -e "\n=============================================================================\n"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
TARGET="${1:-all}"

mkdir -p "$OUT_DIR"
rm -f "${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-"*.zip
rm -f "${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}-"*.xpi
rm -f "${OUT_DIR}/${EXTENSION_NAME}-v${VERSION}.xpi"

case "$TARGET" in
  chrome)
    build_browser "chrome"
    ;;
  chromium)
    build_browser "chromium"
    print_manual_install_instructions "chromium"
    ;;
  edge)
    build_browser "edge"
    print_manual_install_instructions "edge"
    ;;
  firefox)
    build_browser "firefox"
    package_source
    print_manual_install_instructions "firefox"
    ;;
  all)
    info "Building all four browser targets..."
    build_browser "chrome"
    build_browser "chromium"
    build_browser "edge"
    build_browser "firefox"
    package_source
    echo ""
    info "All packages ready in ${OUT_DIR}/"
    ls -lh "${OUT_DIR}/"
    print_manual_install_instructions "all"
    ;;
  from-dist)
    info "Packaging existing browser build outputs..."
    package_browser_dist "chrome" "${DIST_DIR}/chrome"
    package_browser_dist "chromium" "${DIST_DIR}/chromium"
    package_browser_dist "edge" "${DIST_DIR}/edge"
    package_browser_dist "firefox" "${DIST_DIR}/firefox"
    package_source
    echo ""
    info "All packages ready in ${OUT_DIR}/"
    ls -lh "${OUT_DIR}/"
    ;;
  *)
    error "Unknown target '${TARGET}'. Use: chrome | chromium | edge | firefox | all | from-dist"
    ;;
esac
