import Quill from 'quill';
import MapBlot from "../blots/map.js";
import MapModal from "./map-modal.js";
Quill.register(MapBlot);
const MAPS_INSTANCES = new WeakMap();
const LOADED_SCRIPTS = new Map();
const LOADED_STYLESHEETS = new Set();
function loadScript(url) {
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
  if (LOADED_STYLESHEETS.has(url)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  LOADED_STYLESHEETS.add(url);
}
function injectLeafletStyles() {
  loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
}
export class MapModule {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.observer = null;
    this.quill = quill;
    this.options = {
      provider: options.provider || 'osm',
      center: options.center || [48.8566, 2.3522],
      zoom: options.zoom || 13,
      googleApiKey: options.googleApiKey || null,
      tileUrl: options.tileUrl || null,
      height: options.height || '300px',
      scrollWheelZoom: options.scrollWheelZoom !== false,
      draggable: options.draggable !== false
    };
    this.addToolbarHandler();
    this.observeEditor();
    this.initExistingMaps();
  }
  getQuill() {
    return this.quill;
  }
  getMapOptions() {
    return this.options;
  }
  addToolbarHandler() {
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar) return;
    toolbar.addHandler('map', () => {
      const modal = new MapModal(this);
      modal.open();
    });
  }
  insertMap(lat, lng) {
    const range = this.quill.getSelection(true);
    if (!range) return;
    const mapValue = {
      lat: lat != null ? lat : this.options.center[0],
      lng: lng != null ? lng : this.options.center[1],
      zoom: this.options.zoom,
      provider: this.options.provider,
      googleApiKey: this.options.googleApiKey,
      tileUrl: this.options.tileUrl,
      height: this.options.height,
      scrollWheelZoom: this.options.scrollWheelZoom,
      draggable: this.options.draggable
    };
    this.quill.insertEmbed(range.index, 'map', mapValue, 'user');
    this.quill.insertText(range.index + 1, '\n', 'api');
    this.quill.setSelection(range.index + 2, 'api');
  }
  observeEditor() {
    const editor = this.quill.root;
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement && node.classList.contains('ql-map')) {
            this.initMapForContainer(node);
          }
        }
      }
    });
    this.observer.observe(editor, {
      childList: true,
      subtree: true
    });
  }
  initExistingMaps() {
    const maps = this.quill.root.querySelectorAll('.ql-map');
    maps.forEach(map => {
      this.initMapForContainer(map);
    });
  }
  initMapForContainer(container) {
    if (MAPS_INSTANCES.has(container)) return;
    const value = MapBlot.value(container);
    const placeholder = container.querySelector('.ql-map-placeholder');
    if (placeholder) placeholder.remove();
    if (value.provider === 'google' && value.googleApiKey) {
      this.initGoogleMap(container, value);
    } else {
      this.initOsmMap(container, value);
    }
  }
  async initOsmMap(container, value) {
    try {
      injectLeafletStyles();
      const L = await import('leaflet');
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      container.appendChild(mapDiv);
      const tileUrl = value.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const map = L.map(mapDiv, {
        center: [value.lat, value.lng],
        zoom: value.zoom,
        scrollWheelZoom: value.scrollWheelZoom
      });
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      const marker = L.marker([value.lat, value.lng], {
        draggable: value.draggable
      }).addTo(map);
      if (value.draggable) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          container.setAttribute('data-lat', String(pos.lat));
          container.setAttribute('data-lng', String(pos.lng));
        });
      }
      MAPS_INSTANCES.set(container, {
        map,
        marker,
        library: 'leaflet'
      });
      this.setupContainerInteraction(container, mapDiv, map, 'leaflet');
    } catch (error) {
      console.error('Failed to initialize Leaflet map:', error);
      this.showMapError(container, 'Failed to load map library');
    }
  }
  async initGoogleMap(container, value) {
    try {
      const apiKey = value.googleApiKey;
      if (!apiKey) {
        this.showMapError(container, 'Google Maps API key is required');
        return;
      }
      await loadScript("https://maps.googleapis.com/maps/api/js?key=" + apiKey);
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      container.appendChild(mapDiv);
      const center = {
        lat: value.lat,
        lng: value.lng
      };
      const map = new window.google.maps.Map(mapDiv, {
        center,
        zoom: value.zoom,
        scrollwheel: value.scrollWheelZoom,
        mapTypeControl: false,
        streetViewControl: false
      });
      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: value.draggable
      });
      if (value.draggable) {
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          container.setAttribute('data-lat', String(pos.lat()));
          container.setAttribute('data-lng', String(pos.lng()));
        });
      }
      MAPS_INSTANCES.set(container, {
        map,
        marker,
        library: 'google'
      });
      this.setupContainerInteraction(container, mapDiv, map, 'google');
    } catch (error) {
      console.error('Failed to initialize Google Map:', error);
      this.showMapError(container, 'Failed to load Google Maps');
    }
  }
  setupContainerInteraction(container, mapDiv, map, library) {
    const activate = () => {
      container.style.pointerEvents = 'auto';
      mapDiv.style.pointerEvents = 'auto';
      if (library === 'leaflet') {
        map.invalidateSize();
      } else if (library === 'google') {
        window.google.maps.event.trigger(map, 'resize');
      }
    };
    const deactivate = () => {
      container.style.pointerEvents = 'none';
      mapDiv.style.pointerEvents = 'none';
    };
    container.addEventListener('mousedown', activate);
    container.addEventListener('touchstart', activate);
    const handleOutsideClick = e => {
      if (!container.contains(e.target)) {
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
  showMapError(container, message) {
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