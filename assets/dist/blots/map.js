import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class MapBlot extends BlockEmbed {
  static create(value) {
    var _value$lat, _value$lng, _value$zoom, _value$provider, _value$height, _value$width;
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    const lat = (_value$lat = value == null ? void 0 : value.lat) != null ? _value$lat : 48.8566;
    const lng = (_value$lng = value == null ? void 0 : value.lng) != null ? _value$lng : 2.3522;
    const zoom = (_value$zoom = value == null ? void 0 : value.zoom) != null ? _value$zoom : 13;
    const provider = (_value$provider = value == null ? void 0 : value.provider) != null ? _value$provider : 'osm';
    const height = (_value$height = value == null ? void 0 : value.height) != null ? _value$height : '300px';
    const scrollWheelZoom = (value == null ? void 0 : value.scrollWheelZoom) !== false ? 'true' : 'false';
    const draggable = (value == null ? void 0 : value.draggable) !== false ? 'true' : 'false';
    node.setAttribute('data-lat', String(lat));
    node.setAttribute('data-lng', String(lng));
    node.setAttribute('data-zoom', String(zoom));
    node.setAttribute('data-provider', provider);
    node.setAttribute('data-scroll-wheel-zoom', scrollWheelZoom);
    node.setAttribute('data-draggable', draggable);
    if (value != null && value.googleApiKey) {
      node.setAttribute('data-google-api-key', value.googleApiKey);
    }
    if (value != null && value.tileUrl) {
      node.setAttribute('data-tile-url', value.tileUrl);
    }
    if (value != null && value.marker) {
      node.setAttribute('data-marker', JSON.stringify(value.marker));
    }
    node.style.height = height;
    node.style.width = (_value$width = value == null ? void 0 : value.width) != null ? _value$width : '100%';
    node.style.borderRadius = '4px';
    node.style.overflow = 'hidden';
    node.style.position = 'relative';
    node.style.background = '#e8e8e8';
    const placeholder = document.createElement('div');
    placeholder.className = 'ql-map-placeholder';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.height = '100%';
    placeholder.style.color = '#666';
    placeholder.style.fontSize = '14px';
    placeholder.textContent = 'Loading map...';
    node.appendChild(placeholder);
    return node;
  }
  static value(node) {
    let marker = null;
    const markerAttr = node.getAttribute('data-marker');
    if (markerAttr) {
      try {
        marker = JSON.parse(markerAttr);
      } catch (_unused) {
        marker = null;
      }
    }
    return {
      lat: parseFloat(node.getAttribute('data-lat') || '48.8566'),
      lng: parseFloat(node.getAttribute('data-lng') || '2.3522'),
      zoom: parseInt(node.getAttribute('data-zoom') || '13', 10),
      provider: node.getAttribute('data-provider') || 'osm',
      googleApiKey: node.getAttribute('data-google-api-key') || null,
      tileUrl: node.getAttribute('data-tile-url') || null,
      height: node.style.height || '300px',
      width: node.style.width || '100%',
      scrollWheelZoom: node.getAttribute('data-scroll-wheel-zoom') !== 'false',
      draggable: node.getAttribute('data-draggable') !== 'false',
      marker
    };
  }
  static formats(node) {
    const formats = {};
    const style = node.getAttribute('style');
    if (style) {
      formats.style = style;
    }
    const align = node.getAttribute('align');
    if (align) {
      formats.align = align;
    }
    if (node.style.width) {
      formats.width = node.style.width;
    }
    return formats;
  }
  format(name, value) {
    if (name === 'align') {
      if (value === 'right') {
        this.domNode.style.float = 'right';
        this.domNode.style.margin = '';
        this.domNode.setAttribute('align', 'right');
      } else if (value === 'center') {
        this.domNode.style.float = 'none';
        this.domNode.style.margin = '0 auto';
        this.domNode.setAttribute('align', 'center');
      } else if (value === 'leftBlock') {
        this.domNode.style.float = 'left';
        this.domNode.style.margin = '0 10px 10px 0';
        this.domNode.setAttribute('align', 'left');
      } else {
        this.domNode.style.float = 'none';
        this.domNode.style.margin = '';
        this.domNode.setAttribute('align', 'left');
      }
    } else if (name === 'style') {
      this.domNode.setAttribute('style', value);
      this.domNode.style.position = 'relative';
      this.domNode.style.overflow = 'hidden';
    } else if (name === 'width') {
      if (value) {
        this.domNode.style.width = value;
      } else {
        this.domNode.style.width = '100%';
      }
    } else {
      super.format(name, value);
    }
  }
}
MapBlot.blotName = 'map';
MapBlot.tagName = 'div';
MapBlot.className = 'ql-map';
export default MapBlot;