const LOADED_SCRIPTS = new Map<string, Promise<void>>();
const LOADED_STYLESHEETS = new Map<string, Promise<void>>();

export function loadScript(url: string): Promise<void> {
    if (LOADED_SCRIPTS.has(url)) {
        return LOADED_SCRIPTS.get(url)!;
    }
    const promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
    LOADED_SCRIPTS.set(url, promise);
    return promise;
}

function loadStylesheet(url: string): Promise<void> {
    if (LOADED_STYLESHEETS.has(url)) {
        return LOADED_STYLESHEETS.get(url)!;
    }
    const promise = new Promise<void>((resolve) => {
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

export async function injectLeafletStyles(): Promise<void> {
    await loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
}
