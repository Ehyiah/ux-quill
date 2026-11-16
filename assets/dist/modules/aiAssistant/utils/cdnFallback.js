export function warnCdnFallback(packageName) {
  console.warn("[ux-quill][ai-assistant] " + packageName + " is not installed locally - falling back to CDN (jsdelivr). " + 'This works but is not recommended in production: install the package or add an importmap entry to self-host it.');
}