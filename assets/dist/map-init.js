import { injectLeafletStyles, loadScript } from "./modules/map-utils.js";
const LEAFLET_MARKER_ICON = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const LEAFLET_MARKER_ICON_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const LEAFLET_MARKER_SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
async function initMap(container) {
  const lat = parseFloat(container.getAttribute('data-lat') || '48.8566');
  const lng = parseFloat(container.getAttribute('data-lng') || '2.3522');
  const zoom = parseInt(container.getAttribute('data-zoom') || '13', 10);
  const tileUrl = container.getAttribute('data-tile-url') || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const height = container.style.height || '300px';
  const placeholder = container.querySelector('.ql-map-placeholder');
  if (placeholder) placeholder.remove();
  const provider = container.getAttribute('data-provider') || 'osm';
  if (provider === 'google') {
    const apiKey = container.getAttribute('data-google-api-key');
    if (!apiKey) {
      showError(container, 'Google Maps API key is required');
      return;
    }
    await initGoogleMap(container, lat, lng, zoom, apiKey);
  } else {
    await initOsmMap(container, lat, lng, zoom, tileUrl, height);
  }
}
async function initOsmMap(container, lat, lng, zoom, tileUrl, height) {
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
    const markerIcon = new L.Icon({
      iconUrl: LEAFLET_MARKER_ICON,
      iconRetinaUrl: LEAFLET_MARKER_ICON_2X,
      shadowUrl: LEAFLET_MARKER_SHADOW,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.marker([lat, lng], {
      icon: markerIcon
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 100);
  } catch (error) {
    console.error('Failed to initialize Leaflet map:', error);
    showError(container, 'Failed to load map');
  }
}
async function initGoogleMap(container, lat, lng, zoom, apiKey) {
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
    new window.google.maps.Marker({
      position: {
        lat,
        lng
      },
      map
    });
  } catch (error) {
    console.error('Failed to initialize Google Map:', error);
    showError(container, 'Failed to load Google Maps');
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
  const maps = document.querySelectorAll('.ql-map');
  maps.forEach(el => {
    initMap(el);
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuillMaps);
  } else {
    initQuillMaps();
  }
}