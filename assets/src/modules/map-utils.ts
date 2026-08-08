import type { MapMarkerOptions } from '../types.d.ts';

const LOADED_SCRIPTS = new Map<string, Promise<void>>();
const LOADED_STYLESHEETS = new Map<string, Promise<void>>();

export const LEAFLET_DEFAULT_MARKER_ICON = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
export const LEAFLET_DEFAULT_MARKER_ICON_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
export const LEAFLET_DEFAULT_MARKER_SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

export function buildLeafletIcon(L: any, marker?: MapMarkerOptions | null): any {
    if (marker?.iconUrl) {
        return new L.Icon({
            iconUrl: marker.iconUrl,
            iconRetinaUrl: marker.iconRetinaUrl ?? undefined,
            shadowUrl: marker.shadowUrl ?? undefined,
            iconSize: marker.iconSize ?? undefined,
            iconAnchor: marker.iconAnchor ?? undefined,
            popupAnchor: marker.popupAnchor ?? undefined,
            shadowSize: marker.shadowSize ?? undefined,
        });
    }

    if (marker?.label) {
        return L.divIcon({
            html: `<div style="display:flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:50%;background:#d43f3f;color:#fff;font-weight:bold;font-size:12px;padding:0 4px;box-shadow:0 1px 3px rgba(0,0,0,.4)">${marker.label}</div>`,
            className: '',
            iconSize: marker.iconSize ?? undefined,
            iconAnchor: marker.iconAnchor ?? [12, 24],
        });
    }

    return new L.Icon({
        iconUrl: LEAFLET_DEFAULT_MARKER_ICON,
        iconRetinaUrl: LEAFLET_DEFAULT_MARKER_ICON_2X,
        shadowUrl: LEAFLET_DEFAULT_MARKER_SHADOW,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
}

export function buildGoogleMarkerOptions(marker?: MapMarkerOptions | null): any {
    if (!marker?.iconUrl) {
        return {};
    }

    const options: any = {
        url: marker.iconUrl,
        scaledSize: marker.iconSize ? new (window as any).google.maps.Size(marker.iconSize[0], marker.iconSize[1]) : new (window as any).google.maps.Size(25, 41),
    };

    if (marker.iconAnchor) {
        options.anchor = new (window as any).google.maps.Point(marker.iconAnchor[0], marker.iconAnchor[1]);
    }

    if (marker.label) {
        options.label = marker.label;
    }

    return options;
}

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
