function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { Controller } from '@hotwired/stimulus';
import { injectLeafletStyles, loadScript, buildLeafletIcon, buildGoogleMarkerOptions } from "./modules/map-utils.js";
const initializedMaps = new WeakSet();
let mapsCompletionPromise = null;
function dispatchMapEvent(container, name, detail) {
  container.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    detail
  }));
}
function readMarker(container) {
  const attr = container.getAttribute('data-marker');
  if (!attr) return null;
  try {
    return JSON.parse(attr);
  } catch (_unused) {
    return null;
  }
}
function readMapValue(container) {
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
    marker: readMarker(container)
  };
}
async function initMap(container) {
  const value = readMapValue(container);
  dispatchMapEvent(container, 'ux-quill:map:before-init', {
    options: value
  });

  // The saved content may contain the Leaflet DOM rendered in the editor (tiles, panes, marker).
  // Clear it so a fresh map is rendered from the data attributes.
  container.innerHTML = '';
  let result;
  if (value.provider === 'google') {
    if (!value.googleApiKey) {
      showError(container, 'Google Maps API key is required');
      dispatchMapEvent(container, 'ux-quill:map:error', {
        options: value,
        message: 'Google Maps API key is required'
      });
      return;
    }
    result = await initGoogleMap(container, value.lat, value.lng, value.zoom, value.googleApiKey, value.marker);
  } else {
    result = await initOsmMap(container, value.lat, value.lng, value.zoom, value.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', value.height, value.marker);
  }
  if (result.ok) {
    dispatchMapEvent(container, 'ux-quill:map:initialized', {
      options: value
    });
  } else {
    dispatchMapEvent(container, 'ux-quill:map:error', {
      options: value,
      message: result.message
    });
  }
}
async function initOsmMap(container, lat, lng, zoom, tileUrl, height, marker) {
  try {
    await injectLeafletStyles();
    const L = await import('leaflet');
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = height;
    container.appendChild(mapDiv);
    const map = L.map(mapDiv, {
      center: [lat, lng],
      zoom,
      scrollWheelZoom: false
    });
    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const markerIcon = buildLeafletIcon(L, marker);
    L.marker([lat, lng], {
      icon: markerIcon
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
    return {
      ok: true
    };
  } catch (error) {
    console.error('Failed to initialize Leaflet map:', error);
    showError(container, 'Failed to load map');
    return {
      ok: false,
      message: 'Failed to load map'
    };
  }
}
async function initGoogleMap(container, lat, lng, zoom, apiKey, marker) {
  try {
    await loadScript("https://maps.googleapis.com/maps/api/js?key=" + apiKey);
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = container.style.height || '300px';
    container.appendChild(mapDiv);
    const map = new window.google.maps.Map(mapDiv, {
      center: {
        lat,
        lng
      },
      zoom,
      scrollwheel: false,
      mapTypeControl: false,
      streetViewControl: false
    });
    new window.google.maps.Marker(_extends({
      position: {
        lat,
        lng
      },
      map
    }, buildGoogleMarkerOptions(marker)));
    return {
      ok: true
    };
  } catch (error) {
    console.error('Failed to initialize Google Map:', error);
    showError(container, 'Failed to load Google Maps');
    return {
      ok: false,
      message: 'Failed to load Google Maps'
    };
  }
}
function showError(container, message) {
  container.innerHTML = '';
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;color:#cc0000;font-size:14px';
  errorDiv.textContent = message;
  container.appendChild(errorDiv);
}
export function initQuillMaps() {
  if (!mapsCompletionPromise) {
    const pending = [];
    document.querySelectorAll('.ql-map').forEach(el => {
      if (initializedMaps.has(el)) return;
      initializedMaps.add(el);
      pending.push(initMap(el));
    });
    mapsCompletionPromise = Promise.allSettled(pending).then(() => undefined);
  }
  return mapsCompletionPromise;
}
export default class extends Controller {
  connect() {
    initQuillMaps().then(() => {
      this.element.dispatchEvent(new CustomEvent('ux-quill:maps:completed', {
        bubbles: true
      }));
    });
  }
}