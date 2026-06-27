import type { MapModule } from './mapModule.ts';

type NominatimResult = {
    lat: string;
    lon: string;
    display_name: string;
};

export default class MapModal {
    private module: MapModule;
    private container: HTMLDivElement | null = null;
    private map: any = null;
    private marker: any = null;
    private selectedLat: number;
    private selectedLng: number;
    private searchTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(module: MapModule) {
        this.module = module;
        const center = module.getMapOptions().center || [48.8566, 2.3522];
        this.selectedLat = center[0];
        this.selectedLng = center[1];
    }

    async open(): Promise<void> {
        this.injectStyles();
        this.renderModal();
        await this.initPreviewMap();
    }

    close(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        document.removeEventListener('mousedown', this.onOutsideSearchClick);
    }

    private injectStyles(): void {
        const id = 'quill-map-modal-styles';
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
            .quill-map-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999}
            .quill-map-window{background:#fff;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.2);width:560px;max-width:90vw;max-height:85vh;display:flex;flex-direction:column;overflow:visible}
            .quill-map-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e5e7eb}
            .quill-map-header h3{margin:0;font-size:16px;font-weight:600;color:#1f2937}
            .quill-map-close{background:none;border:none;cursor:pointer;padding:4px;color:#6b7280;border-radius:4px;display:flex;align-items:center;justify-content:center}
            .quill-map-close:hover{background:#f3f4f6;color:#1f2937}
            .quill-map-search{padding:12px 18px;border-bottom:1px solid #e5e7eb;position:relative}
            .quill-map-search-input{width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box}
            .quill-map-search-input:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.2)}
            .quill-map-search-results{position:absolute;top:100%;left:18px;right:18px;background:#fff;border:1px solid #d1d5db;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,.1);max-height:200px;overflow-y:auto;z-index:9999}
            .quill-map-search-result{padding:8px 12px;cursor:pointer;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6}
            .quill-map-search-result:last-child{border-bottom:none}
            .quill-map-search-result:hover{background:#f3f4f6}
            .quill-map-preview{height:320px;width:100%;background:#e5e7eb}
            .quill-map-footer{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-top:1px solid #e5e7eb}
            .quill-map-coords{font-size:12px;color:#6b7280}
            .quill-map-confirm{padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer}
            .quill-map-confirm:hover{background:#2563eb}
        `;
        document.head.appendChild(style);
    }

    private renderModal(): void {
        this.container = document.createElement('div');
        this.container.className = 'quill-map-modal';
        this.container.innerHTML = `
            <div class="quill-map-window">
                <div class="quill-map-header">
                    <h3>Choose map location</h3>
                    <button class="quill-map-close" title="Close" aria-label="Close">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="quill-map-search">
                    <input type="text" class="quill-map-search-input" placeholder="Search for a location..." />
                    <div class="quill-map-search-results" style="display:none"></div>
                </div>
                <div class="quill-map-preview" id="quill-map-preview"></div>
                <div class="quill-map-footer">
                    <span class="quill-map-coords">${this.selectedLat.toFixed(5)}, ${this.selectedLng.toFixed(5)}</span>
                    <button class="quill-map-confirm">Insert Map</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('.quill-map-close')!.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.close();
        });

        this.container.querySelector('.quill-map-confirm')!.addEventListener('click', () => {
            this.module.insertMap(this.selectedLat, this.selectedLng);
            this.close();
        });

        const searchInput = this.container.querySelector('.quill-map-search-input') as HTMLInputElement;
        searchInput.addEventListener('input', () => {
            this.onSearchInput(searchInput.value);
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 1) {
                this.showSearchResults();
            }
        });

        document.addEventListener('mousedown', this.onOutsideSearchClick);
    }

    private onOutsideSearchClick = (e: MouseEvent): void => {
        if (this.container && !this.container.querySelector('.quill-map-search')?.contains(e.target as Node)) {
            this.hideSearchResults();
        }
    };

    private async initPreviewMap(): Promise<void> {
        const previewEl = this.container?.querySelector('#quill-map-preview');
        if (!previewEl) return;

        try {
            const L = await import('leaflet');

            this.map = (L as any).map(previewEl as HTMLElement, {
                center: [this.selectedLat, this.selectedLng],
                zoom: 13,
                scrollWheelZoom: true,
            });

            const tileUrl = this.module.getMapOptions().tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            (L as any).tileLayer(tileUrl, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.map);

            this.marker = (L as any).marker([this.selectedLat, this.selectedLng], {
                draggable: true,
            }).addTo(this.map);

            this.marker.on('dragend', () => {
                const pos = this.marker.getLatLng();
                this.selectedLat = pos.lat;
                this.selectedLng = pos.lng;
                this.updateCoords();
            });

            this.map.on('click', (e: any) => {
                this.selectedLat = e.latlng.lat;
                this.selectedLng = e.latlng.lng;
                this.marker.setLatLng(e.latlng);
                this.updateCoords();
            });
        } catch (error) {
            console.error('Failed to initialize preview map:', error);
        }
    }

    private updateCoords(): void {
        const coordsEl = this.container?.querySelector('.quill-map-coords');
        if (coordsEl) {
            coordsEl.textContent = `${this.selectedLat.toFixed(5)}, ${this.selectedLng.toFixed(5)}`;
        }
    }

    private onSearchInput(value: string): void {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (value.trim().length < 2) {
            this.hideSearchResults();
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this.searchLocations(value.trim());
        }, 400);
    }

    private async searchLocations(query: string): Promise<void> {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'SymfonyUXQuillMap/1.0',
                },
            });

            if (!response.ok) return;

            const results: NominatimResult[] = await response.json();
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Geocoding search failed:', error);
        }
    }

    private renderSearchResults(results: NominatimResult[]): void {
        const container = this.container?.querySelector('.quill-map-search-results');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            this.hideSearchResults();
            return;
        }

        results.forEach((result) => {
            const item = document.createElement('div');
            item.className = 'quill-map-search-result';
            item.textContent = result.display_name;
            item.addEventListener('click', () => {
                this.selectedLat = parseFloat(result.lat);
                this.selectedLng = parseFloat(result.lon);
                this.updateCoords();

                if (this.map) {
                    this.map.setView([this.selectedLat, this.selectedLng], 15);
                    this.marker.setLatLng([this.selectedLat, this.selectedLng]);
                }

                this.hideSearchResults();
                const searchInput = this.container?.querySelector('.quill-map-search-input') as HTMLInputElement;
                if (searchInput) searchInput.value = result.display_name;
            });
            container.appendChild(item);
        });

        this.showSearchResults();
    }

    private showSearchResults(): void {
        const results = this.container?.querySelector('.quill-map-search-results') as HTMLElement;
        if (results) results.style.display = 'block';
    }

    private hideSearchResults(): void {
        const results = this.container?.querySelector('.quill-map-search-results') as HTMLElement;
        if (results) results.style.display = 'none';
    }
}
