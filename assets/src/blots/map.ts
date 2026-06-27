import Quill from 'quill';
import type { MapValue } from '../types.d.ts';

const BlockEmbed = Quill.import('blots/block/embed');

class MapBlot extends BlockEmbed {
    static blotName = 'map';
    static tagName = 'div';
    static className = 'ql-map';

    static create(value: MapValue) {
        const node = super.create();
        node.setAttribute('contenteditable', 'false');

        const lat = value?.lat ?? 48.8566;
        const lng = value?.lng ?? 2.3522;
        const zoom = value?.zoom ?? 13;
        const provider = value?.provider ?? 'osm';
        const height = value?.height ?? '300px';
        const scrollWheelZoom = value?.scrollWheelZoom !== false ? 'true' : 'false';
        const draggable = value?.draggable !== false ? 'true' : 'false';

        node.setAttribute('data-lat', String(lat));
        node.setAttribute('data-lng', String(lng));
        node.setAttribute('data-zoom', String(zoom));
        node.setAttribute('data-provider', provider);
        node.setAttribute('data-scroll-wheel-zoom', scrollWheelZoom);
        node.setAttribute('data-draggable', draggable);

        if (value?.googleApiKey) {
            node.setAttribute('data-google-api-key', value.googleApiKey);
        }
        if (value?.tileUrl) {
            node.setAttribute('data-tile-url', value.tileUrl);
        }

        node.style.height = height;
        node.style.width = '100%';
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

    static value(node: HTMLElement) {
        return {
            lat: parseFloat(node.getAttribute('data-lat') || '48.8566'),
            lng: parseFloat(node.getAttribute('data-lng') || '2.3522'),
            zoom: parseInt(node.getAttribute('data-zoom') || '13', 10),
            provider: node.getAttribute('data-provider') || 'osm',
            googleApiKey: node.getAttribute('data-google-api-key') || null,
            tileUrl: node.getAttribute('data-tile-url') || null,
            height: node.style.height || '300px',
            scrollWheelZoom: node.getAttribute('data-scroll-wheel-zoom') !== 'false',
            draggable: node.getAttribute('data-draggable') !== 'false',
        };
    }
}

export default MapBlot;
