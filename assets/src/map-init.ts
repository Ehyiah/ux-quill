import { Controller } from '@hotwired/stimulus';
import { injectLeafletStyles, loadScript, buildLeafletIcon, buildGoogleMarkerOptions } from './modules/map-utils.ts';

const initializedMaps = new WeakSet<HTMLElement>();

let mapsCompletionPromise: Promise<void> | null = null;

type MapInitResult = { ok: boolean; message?: string };

type MapValue = {
    lat: number;
    lng: number;
    zoom: number;
    provider: string;
    googleApiKey: string | null;
    tileUrl: string | null;
    height: string;
    width: string;
    scrollWheelZoom: boolean;
    draggable: boolean;
    marker: any;
};

function dispatchMapEvent(container: HTMLElement, name: string, detail: Record<string, unknown>): void {
    container.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
}

function readMarker(container: HTMLElement): any | null {
    const attr = container.getAttribute('data-marker');
    if (!attr) return null;
    try {
        return JSON.parse(attr);
    } catch {
        return null;
    }
}

function readMapValue(container: HTMLElement): MapValue {
    return {
        lat: parseFloat(container.getAttribute('data-lat') || '48.8566'),
        lng: parseFloat(container.getAttribute('data-lng') || '2.3522'),
        zoom: parseInt(container.getAttribute('data-zoom') || '13', 10),
        provider: container.getAttribute('data-provider') || 'osm',
        googleApiKey: container.getAttribute('data-google-api-key') || null,
        tileUrl: container.getAttribute('data-tile-url') || null,
        height: container.style.height || '300px',
        width: container.style.width || '100%',
        scrollWheelZoom: container.getAttribute('data-scroll-wheel-zoom') !== 'false',
        draggable: container.getAttribute('data-draggable') !== 'false',
        marker: readMarker(container),
    };
}

async function initMap(container: HTMLElement): Promise<void> {
    const value = readMapValue(container);
    dispatchMapEvent(container, 'ux-quill:map:before-init', { options: value });

    // The saved content may contain the Leaflet DOM rendered in the editor (tiles, panes, marker).
    // Clear it so a fresh map is rendered from the data attributes.
    container.innerHTML = '';

    let result: MapInitResult;
    if (value.provider === 'google') {
        if (!value.googleApiKey) {
            showError(container, 'Google Maps API key is required');
            dispatchMapEvent(container, 'ux-quill:map:error', {
                options: value,
                message: 'Google Maps API key is required',
            });
            return;
        }
        result = await initGoogleMap(container, value.lat, value.lng, value.zoom, value.googleApiKey, value.marker);
    } else {
        result = await initOsmMap(
            container,
            value.lat,
            value.lng,
            value.zoom,
            value.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            value.height,
            value.marker,
        );
    }

    if (result.ok) {
        dispatchMapEvent(container, 'ux-quill:map:initialized', { options: value });
    } else {
        dispatchMapEvent(container, 'ux-quill:map:error', { options: value, message: result.message });
    }
}

async function initOsmMap(
    container: HTMLElement, lat: number, lng: number, zoom: number, tileUrl: string, height: string, marker: any
): Promise<MapInitResult> {
    try {
        await injectLeafletStyles();
        const L = await import('leaflet');

        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = height;
        container.appendChild(mapDiv);

        const map = (L as any).map(mapDiv, {
            center: [lat, lng],
            zoom,
            scrollWheelZoom: false,
        });

        (L as any).tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const markerIcon = buildLeafletIcon(L, marker);

        (L as any).marker([lat, lng], { icon: markerIcon }).addTo(map);

        setTimeout(() => map.invalidateSize(), 100);

        return { ok: true };
    } catch (error) {
        console.error('Failed to initialize Leaflet map:', error);
        showError(container, 'Failed to load map');

        return { ok: false, message: 'Failed to load map' };
    }
}

async function initGoogleMap(
    container: HTMLElement, lat: number, lng: number, zoom: number, apiKey: string, marker: any
): Promise<MapInitResult> {
    try {
        await loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}`);

        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = container.style.height || '300px';
        container.appendChild(mapDiv);

        const map = new (window as any).google.maps.Map(mapDiv, {
            center: { lat, lng },
            zoom,
            scrollwheel: false,
            mapTypeControl: false,
            streetViewControl: false,
        });

        new (window as any).google.maps.Marker({
            position: { lat, lng },
            map,
            ...buildGoogleMarkerOptions(marker),
        });

        return { ok: true };
    } catch (error) {
        console.error('Failed to initialize Google Map:', error);
        showError(container, 'Failed to load Google Maps');

        return { ok: false, message: 'Failed to load Google Maps' };
    }
}

function showError(container: HTMLElement, message: string): void {
    container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#cc0000;font-size:14px';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

export function initQuillMaps(): Promise<void> {
    if (!mapsCompletionPromise) {
        const pending: Promise<unknown>[] = [];
        document.querySelectorAll('.ql-map').forEach((el) => {
            if (initializedMaps.has(el)) return;
            initializedMaps.add(el);
            pending.push(initMap(el as HTMLElement));
        });
        mapsCompletionPromise = Promise.allSettled(pending).then(() => undefined);
    }

    return mapsCompletionPromise;
}

export default class extends Controller {
    connect() {
        initQuillMaps().then(() => {
            this.element.dispatchEvent(new CustomEvent('ux-quill:maps:completed', { bubbles: true }));
        });
    }
}
