function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { injectLeafletStyles, loadScript, buildLeafletIcon, buildGoogleMarkerOptions } from "./modules/map-utils.js";
function readMarker(container) {
  const attr = container.getAttribute('data-marker');
  if (!attr) return null;
  try {
    return JSON.parse(attr);
  } catch (_unused) {
    return null;
  }
}
async function initMap(container) {
  const lat = parseFloat(container.getAttribute('data-lat') || '48.8566');
  const lng = parseFloat(container.getAttribute('data-lng') || '2.3522');
  const zoom = parseInt(container.getAttribute('data-zoom') || '13', 10);
  const tileUrl = container.getAttribute('data-tile-url') || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const height = container.style.height || '300px';
  const placeholder = container.querySelector('.ql-map-placeholder');
  if (placeholder) placeholder.remove();
  const provider = container.getAttribute('data-provider') || 'osm';
  const marker = readMarker(container);
  if (provider === 'google') {
    const apiKey = container.getAttribute('data-google-api-key');
    if (!apiKey) {
      showError(container, 'Google Maps API key is required');
      return;
    }
    await initGoogleMap(container, lat, lng, zoom, apiKey, marker);
  } else {
    await initOsmMap(container, lat, lng, zoom, tileUrl, height, marker);
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
  } catch (error) {
    console.error('Failed to initialize Leaflet map:', error);
    showError(container, 'Failed to load map');
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