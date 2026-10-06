/** Extension version, read from the manifest at runtime. */
export function getVersion(): string {
  return chrome.runtime.getManifest().version;
}
