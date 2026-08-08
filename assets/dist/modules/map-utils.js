const LOADED_SCRIPTS = new Map();
const LOADED_STYLESHEETS = new Map();
export const LEAFLET_DEFAULT_MARKER_ICON = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
export const LEAFLET_DEFAULT_MARKER_ICON_2X = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
export const LEAFLET_DEFAULT_MARKER_SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
export function buildLeafletIcon(L, marker) {
  if (marker != null && marker.iconUrl) {
    var _marker$iconRetinaUrl, _marker$shadowUrl, _marker$iconSize, _marker$iconAnchor, _marker$popupAnchor, _marker$shadowSize;
    return new L.Icon({
      iconUrl: marker.iconUrl,
      iconRetinaUrl: (_marker$iconRetinaUrl = marker.iconRetinaUrl) != null ? _marker$iconRetinaUrl : undefined,
      shadowUrl: (_marker$shadowUrl = marker.shadowUrl) != null ? _marker$shadowUrl : undefined,
      iconSize: (_marker$iconSize = marker.iconSize) != null ? _marker$iconSize : undefined,
      iconAnchor: (_marker$iconAnchor = marker.iconAnchor) != null ? _marker$iconAnchor : undefined,
      popupAnchor: (_marker$popupAnchor = marker.popupAnchor) != null ? _marker$popupAnchor : undefined,
      shadowSize: (_marker$shadowSize = marker.shadowSize) != null ? _marker$shadowSize : undefined
    });
  }
  if (marker != null && marker.label) {
    var _marker$iconSize2, _marker$iconAnchor2;
    return L.divIcon({
      html: "<div style=\"display:flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:50%;background:#d43f3f;color:#fff;font-weight:bold;font-size:12px;padding:0 4px;box-shadow:0 1px 3px rgba(0,0,0,.4)\">" + marker.label + "</div>",
      className: '',
      iconSize: (_marker$iconSize2 = marker.iconSize) != null ? _marker$iconSize2 : undefined,
      iconAnchor: (_marker$iconAnchor2 = marker.iconAnchor) != null ? _marker$iconAnchor2 : [12, 24]
    });
  }
  return new L.Icon({
    iconUrl: LEAFLET_DEFAULT_MARKER_ICON,
    iconRetinaUrl: LEAFLET_DEFAULT_MARKER_ICON_2X,
    shadowUrl: LEAFLET_DEFAULT_MARKER_SHADOW,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}
export function buildGoogleMarkerOptions(marker) {
  if (!(marker != null && marker.iconUrl)) {
    return {};
  }
  const options = {
    url: marker.iconUrl,
    scaledSize: marker.iconSize ? new window.google.maps.Size(marker.iconSize[0], marker.iconSize[1]) : new window.google.maps.Size(25, 41)
  };
  if (marker.iconAnchor) {
    options.anchor = new window.google.maps.Point(marker.iconAnchor[0], marker.iconAnchor[1]);
  }
  if (marker.label) {
    options.label = marker.label;
  }
  return options;
}
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