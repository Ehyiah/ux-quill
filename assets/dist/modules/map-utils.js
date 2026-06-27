const LOADED_SCRIPTS = new Map();
const LOADED_STYLESHEETS = new Map();
export function loadScript(url) {
  if (LOADED_SCRIPTS.has(url)) {
    return LOADED_SCRIPTS.get(url);
  }
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load script: " + url));
    document.head.appendChild(script);
  });
  LOADED_SCRIPTS.set(url, promise);
  return promise;
}
function loadStylesheet(url) {
  if (LOADED_STYLESHEETS.has(url)) {
    return LOADED_STYLESHEETS.get(url);
  }
  const promise = new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  LOADED_STYLESHEETS.set(url, promise);
  return promise;
}
export async function injectLeafletStyles() {
  await loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
}