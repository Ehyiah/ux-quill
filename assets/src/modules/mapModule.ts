import Quill from 'quill';
import MapBlot from '../blots/map.ts';
import MapModal from './map-modal.ts';
import type { MapOptions, MapValue } from '../types.d.ts';
import { loadScript, injectLeafletStyles } from './map-utils.ts';

Quill.register(MapBlot);

const MAPS_INSTANCES = new WeakMap<HTMLElement, any>();

export class MapModule {
    private quill: Quill;
    private options: MapOptions;
    private observer: MutationObserver | null = null;

    constructor(quill: Quill, options: MapOptions) {
        this.quill = quill;
        this.options = {
            provider: options.provider || 'osm',
            center: options.center || [48.8566, 2.3522],
            zoom: options.zoom || 13,
            googleApiKey: options.googleApiKey || null,
            tileUrl: options.tileUrl || null,
            height: options.height || '300px',
            scrollWheelZoom: options.scrollWheelZoom !== false,
            draggable: options.draggable !== false,
        };

        this.addToolbarHandler();
        this.observeEditor();
        this.initExistingMaps();
    }

    public getQuill(): Quill {
        return this.quill;
    }

    public getMapOptions(): MapOptions {
        return this.options;
    }

    private addToolbarHandler(): void {
        const toolbar = this.quill.getModule('toolbar') as any;
        if (!toolbar) return;

        toolbar.addHandler('map', () => {
            const modal = new MapModal(this);
            modal.open();
        });
    }

    public insertMap(lat?: number, lng?: number): void {
        const range = this.quill.getSelection(true);
        if (!range) return;

        const mapValue: MapValue = {
            lat: lat ?? this.options.center![0],
            lng: lng ?? this.options.center![1],
            zoom: this.options.zoom!,
            provider: this.options.provider!,
            googleApiKey: this.options.googleApiKey,
            tileUrl: this.options.tileUrl,
            height: this.options.height,
            scrollWheelZoom: this.options.scrollWheelZoom,
            draggable: this.options.draggable,
        };

        this.quill.insertEmbed(range.index, 'map', mapValue, 'user');
        this.quill.insertText(range.index + 1, '\n', 'api');
        this.quill.setSelection(range.index + 2, 'api');
    }

    private observeEditor(): void {
        const editor = this.quill.root;
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node instanceof HTMLElement && node.classList.contains('ql-map')) {
                        this.initMapForContainer(node);
                    }
                }
            }
        });
        this.observer.observe(editor, { childList: true, subtree: true });
    }

    private initExistingMaps(): void {
        const maps = this.quill.root.querySelectorAll('.ql-map');
        maps.forEach((map) => {
            this.initMapForContainer(map as HTMLElement);
        });
    }

    private initMapForContainer(container: HTMLElement): void {
        if (MAPS_INSTANCES.has(container)) return;

        const value: MapValue = MapBlot.value(container);
        const placeholder = container.querySelector('.ql-map-placeholder');
        if (placeholder) placeholder.remove();

        if (value.provider === 'google' && value.googleApiKey) {
            this.initGoogleMap(container, value);
        } else {
            this.initOsmMap(container, value);
        }
    }

    private async initOsmMap(container: HTMLElement, value: MapValue): Promise<void> {
        try {
            await injectLeafletStyles();
            const L = await import('leaflet');

            const markerIcon = new (L as any).Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });

            const mapDiv = document.createElement('div');
            mapDiv.style.width = '100%';
            mapDiv.style.height = '100%';
            container.appendChild(mapDiv);

            const tileUrl = value.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const map = (L as any).map(mapDiv, {
                center: [value.lat, value.lng],
                zoom: value.zoom,
                scrollWheelZoom: value.scrollWheelZoom,
            });

            (L as any).tileLayer(tileUrl, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const marker = (L as any).marker([value.lat, value.lng], {
                draggable: value.draggable,
                icon: markerIcon,
            }).addTo(map);

            if (value.draggable) {
                marker.on('dragend', () => {
                    const pos = marker.getLatLng();
                    container.setAttribute('data-lat', String(pos.lat));
                    container.setAttribute('data-lng', String(pos.lng));
                });
            }

            MAPS_INSTANCES.set(container, { map, marker, library: 'leaflet' });

            this.setupContainerInteraction(container, mapDiv, map, 'leaflet');
        } catch (error) {
            console.error('Failed to initialize Leaflet map:', error);
            this.showMapError(container, 'Failed to load map library');
        }
    }

    private async initGoogleMap(container: HTMLElement, value: MapValue): Promise<void> {
        try {
            const apiKey = value.googleApiKey;
            if (!apiKey) {
                this.showMapError(container, 'Google Maps API key is required');
                return;
            }

            await loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}`);

            const mapDiv = document.createElement('div');
            mapDiv.style.width = '100%';
            mapDiv.style.height = '100%';
            container.appendChild(mapDiv);

            const center = { lat: value.lat, lng: value.lng };
            const map = new (window as any).google.maps.Map(mapDiv, {
                center,
                zoom: value.zoom,
                scrollwheel: value.scrollWheelZoom,
                mapTypeControl: false,
                streetViewControl: false,
            });

            const marker = new (window as any).google.maps.Marker({
                position: center,
                map,
                draggable: value.draggable,
            });

            if (value.draggable) {
                marker.addListener('dragend', () => {
                    const pos = marker.getPosition();
                    container.setAttribute('data-lat', String(pos.lat()));
                    container.setAttribute('data-lng', String(pos.lng()));
                });
            }

            MAPS_INSTANCES.set(container, { map, marker, library: 'google' });

            this.setupContainerInteraction(container, mapDiv, map, 'google');
        } catch (error) {
            console.error('Failed to initialize Google Map:', error);
            this.showMapError(container, 'Failed to load Google Maps');
        }
    }

    private setupContainerInteraction(
        container: HTMLElement,
        mapDiv: HTMLElement,
        map: any,
        library: string
    ): void {
        const activate = () => {
            container.style.pointerEvents = 'auto';
            mapDiv.style.pointerEvents = 'auto';
            if (library === 'leaflet') {
                map.invalidateSize();
            } else if (library === 'google') {
                (window as any).google.maps.event.trigger(map, 'resize');
            }
        };

        const deactivate = () => {
            container.style.pointerEvents = 'none';
            mapDiv.style.pointerEvents = 'none';
        };

        container.addEventListener('mousedown', activate);
        container.addEventListener('touchstart', activate);

        const handleOutsideClick = (e: MouseEvent) => {
            if (!container.contains(e.target as Node)) {
                deactivate();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        const instance = MAPS_INSTANCES.get(container);
        if (instance) {
            instance.cleanup = () => {
                document.removeEventListener('mousedown', handleOutsideClick);
            };
        }

        deactivate();
    }

    private showMapError(container: HTMLElement, message: string): void {
        container.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.style.display = 'flex';
        errorDiv.style.alignItems = 'center';
        errorDiv.style.justifyContent = 'center';
        errorDiv.style.height = '100%';
        errorDiv.style.color = '#cc0000';
        errorDiv.style.fontSize = '14px';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);
    }
}
