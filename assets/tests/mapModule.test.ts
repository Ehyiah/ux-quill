import Quill from 'quill';

jest.mock('quill', () => {
    const mockIcons: Record<string, string> = {};

    const mockQuillInstance = {
        root: document.createElement('div'),
        getModule: jest.fn().mockReturnValue(null),
        getSelection: jest.fn(),
        insertEmbed: jest.fn(),
        insertText: jest.fn(),
        setSelection: jest.fn(),
        update: jest.fn(),
        on: jest.fn(),
    };

    const MockQuill = jest.fn().mockImplementation(() => mockQuillInstance);
    MockQuill.register = jest.fn();
    MockQuill.import = jest.fn().mockImplementation((name: string) => {
        if (name === 'ui/icons') {
            return mockIcons;
        }
        if (name === 'blots/block/embed') {
            return class MockBlockEmbed {
                static blotName = '';
                static tagName = 'div';
                static className = '';
                static create(value: any) {
                    const node = document.createElement('div');
                    return node;
                }
                static value(node: HTMLElement) {
                    return {};
                }
            };
        }
        return {};
    });

    return {
        __esModule: true,
        default: MockQuill,
    };
});

jest.mock('../src/modules/map-modal.ts', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            open: jest.fn(),
        })),
    };
});

jest.mock('../src/modules/map-utils.ts', () => ({
    loadScript: jest.fn().mockResolvedValue(undefined),
    injectLeafletStyles: jest.fn().mockResolvedValue(undefined),
    buildLeafletIcon: jest.fn((L: any, marker: any) => (L.Icon ? new L.Icon({ iconUrl: 'mock' }) : { mock: true })),
    buildGoogleMarkerOptions: jest.fn(() => ({})),
}));

import { MapModule } from '../src/modules/mapModule';

describe('MapModule', () => {
    let mockQuill: any;
    let mockIcons: Record<string, string>;

    beforeEach(() => {
        jest.clearAllMocks();
        document.querySelectorAll('.ql-map').forEach((el) => el.remove());
        mockQuill = new (Quill as any)();
        mockIcons = (Quill as any).import('ui/icons') as Record<string, string>;
    });

    describe('constructor', () => {
        it('should register toolbar handler', () => {
            const toolbar = {
                container: document.createElement('div'),
                addHandler: jest.fn(),
            };
            mockQuill.getModule.mockReturnValue(toolbar);

            new MapModule(mockQuill, {});
            expect(mockQuill.getModule).toHaveBeenCalledWith('toolbar');
            expect(toolbar.addHandler).toHaveBeenCalledWith('map', expect.any(Function));
        });

        it('should not throw if toolbar is absent', () => {
            mockQuill.getModule.mockReturnValue(null);
            expect(() => {
                new MapModule(mockQuill, {});
            }).not.toThrow();
        });

        it('should log received options when debug is enabled', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            try {
                new MapModule(mockQuill, { debug: true, marker: { iconUrl: 'https://example.com/pin.png' } });
                expect(logSpy).toHaveBeenCalledWith(
                    '[mapModule] options received:',
                    expect.objectContaining({ debug: true, marker: { iconUrl: 'https://example.com/pin.png' } }),
                );
                expect(logSpy).toHaveBeenCalledWith(
                    '[mapModule] resolved options:',
                    expect.objectContaining({ marker: { iconUrl: 'https://example.com/pin.png' } }),
                );
            } finally {
                logSpy.mockRestore();
            }
        });

        it('should not log options when debug is disabled', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            try {
                new MapModule(mockQuill, {});
                expect(logSpy).not.toHaveBeenCalled();
            } finally {
                logSpy.mockRestore();
            }
        });

        it('should set up MutationObserver on quill root', () => {
            new MapModule(mockQuill, {});
            expect(mockQuill.root).toBeDefined();
        });

        it('should expose getQuill()', () => {
            const module = new MapModule(mockQuill, {});
            expect(module.getQuill()).toBe(mockQuill);
        });

        it('should expose getMapOptions() with merged defaults', () => {
            const module = new MapModule(mockQuill, { zoom: 16 });
            const opts = module.getMapOptions();
            expect(opts.zoom).toBe(16);
            expect(opts.provider).toBe('osm');
            expect(opts.center).toEqual([48.8566, 2.3522]);
        });
    });

    describe('insertMap', () => {
        it('should insert a map embed at cursor position', () => {
            mockQuill.getSelection.mockReturnValue({ index: 5 });
            const module = new MapModule(mockQuill, {});
            (module as any).insertMap();

            expect(mockQuill.insertEmbed).toHaveBeenCalledWith(
                5,
                'map',
                expect.objectContaining({
                    lat: 48.8566,
                    lng: 2.3522,
                    zoom: 13,
                    provider: 'osm',
                }),
                'user'
            );
        });

        it('should not insert if getSelection returns null', () => {
            mockQuill.getSelection.mockReturnValue(null);
            const module = new MapModule(mockQuill, {});
            (module as any).insertMap();

            expect(mockQuill.insertEmbed).not.toHaveBeenCalled();
        });

        it('should insert with custom lat/lng when provided', () => {
            mockQuill.getSelection.mockReturnValue({ index: 0 });
            const module = new MapModule(mockQuill, {});
            module.insertMap(51.5074, -0.1278);

            expect(mockQuill.insertEmbed).toHaveBeenCalledWith(
                0,
                'map',
                expect.objectContaining({
                    lat: 51.5074,
                    lng: -0.1278,
                }),
                'user'
            );
        });

        it('should use default center when no lat/lng provided', () => {
            mockQuill.getSelection.mockReturnValue({ index: 0 });
            const module = new MapModule(mockQuill, {});
            module.insertMap();

            expect(mockQuill.insertEmbed).toHaveBeenCalledWith(
                0,
                'map',
                expect.objectContaining({
                    lat: 48.8566,
                    lng: 2.3522,
                }),
                'user'
            );
        });

        it('should use custom center from options when no lat/lng provided', () => {
            mockQuill.getSelection.mockReturnValue({ index: 0 });
            const module = new MapModule(mockQuill, { center: [40.7128, -74.006] });
            module.insertMap();

            expect(mockQuill.insertEmbed).toHaveBeenCalledWith(
                0,
                'map',
                expect.objectContaining({
                    lat: 40.7128,
                    lng: -74.006,
                }),
                'user'
            );
        });
    });

    describe('MapBlot', () => {
        it('should create a map container with correct data attributes', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({
                lat: 51.5074,
                lng: -0.1278,
                zoom: 10,
                provider: 'google',
                googleApiKey: 'test-key',
            });

            expect(node.getAttribute('data-lat')).toBe('51.5074');
            expect(node.getAttribute('data-lng')).toBe('-0.1278');
            expect(node.getAttribute('data-zoom')).toBe('10');
            expect(node.getAttribute('data-provider')).toBe('google');
            expect(node.getAttribute('data-google-api-key')).toBe('test-key');
            expect(node.getAttribute('contenteditable')).toBe('false');
        });

        it('should read value from DOM node', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = document.createElement('div');
            node.setAttribute('data-lat', '48.8566');
            node.setAttribute('data-lng', '2.3522');
            node.setAttribute('data-zoom', '13');
            node.setAttribute('data-provider', 'osm');
            node.style.height = '300px';

            const value = MapBlot.value(node);
            expect(value).toEqual({
                lat: 48.8566,
                lng: 2.3522,
                zoom: 13,
                provider: 'osm',
                googleApiKey: null,
                tileUrl: null,
                height: '300px',
                width: '100%',
                scrollWheelZoom: true,
                draggable: true,
                marker: null,
            });
        });

        it('should serialize marker options to data-marker attribute', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({
                lat: 48.8566,
                lng: 2.3522,
                marker: { iconUrl: 'https://example.com/pin.svg', iconSize: [40, 40], label: 'A' },
            });

            expect(node.getAttribute('data-marker')).toBe(
                JSON.stringify({ iconUrl: 'https://example.com/pin.svg', iconSize: [40, 40], label: 'A' }),
            );
        });

        it('should not serialize data-marker when marker is absent', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({ lat: 1, lng: 2 });

            expect(node.hasAttribute('data-marker')).toBe(false);
        });

        it('should parse data-marker attribute into marker options', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = document.createElement('div');
            node.setAttribute('data-marker', JSON.stringify({ iconUrl: 'https://example.com/pin.svg', iconSize: [40, 40] }));

            const value = MapBlot.value(node);
            expect(value.marker).toEqual({ iconUrl: 'https://example.com/pin.svg', iconSize: [40, 40] });
        });

        it('should fall back to null marker when data-marker is invalid JSON', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = document.createElement('div');
            node.setAttribute('data-marker', '{invalid json');

            const value = MapBlot.value(node);
            expect(value.marker).toBeNull();
        });

        it('should read align and style formats from DOM node', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = document.createElement('div');
            node.setAttribute('align', 'center');
            node.setAttribute('style', 'float: none; margin: 0 auto;');

            expect(MapBlot.formats(node)).toEqual({
                style: 'float: none; margin: 0 auto;',
                align: 'center',
            });
        });

        it('should apply align format to the node', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({ lat: 1, lng: 2 });

            MapBlot.prototype.format.call({ domNode: node }, 'align', 'center');

            expect(node.getAttribute('align')).toBe('center');
            expect(node.style.float).toBe('none');
            expect(node.style.margin).toBe('0px auto');
        });

        it('should apply float align format and keep layout styles on style format', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({ lat: 1, lng: 2 });

            MapBlot.prototype.format.call({ domNode: node }, 'align', 'leftBlock');
            expect(node.getAttribute('align')).toBe('left');
            expect(node.style.float).toBe('left');

            MapBlot.prototype.format.call({ domNode: node }, 'style', 'float: right;');
            expect(node.style.float).toBe('right');
            expect(node.style.position).toBe('relative');
            expect(node.style.overflow).toBe('hidden');
        });

        it('should apply width format to the node', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({ lat: 1, lng: 2 });

            MapBlot.prototype.format.call({ domNode: node }, 'width', '50%');
            expect(node.style.width).toBe('50%');

            MapBlot.prototype.format.call({ domNode: node }, 'width', '320px');
            expect(node.style.width).toBe('320px');
        });

        it('should expose width format', async () => {
            const { default: MapBlot } = await import('../src/blots/map');
            const node = MapBlot.create({ lat: 1, lng: 2 });
            node.style.width = '75%';

            expect(MapBlot.formats(node)).toEqual(expect.objectContaining({ width: '75%' }));
        });
    });

    describe('editMapLocation', () => {
        it('should open the modal pre-filled with the map location', () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');
            container.setAttribute('data-lat', '48.8584');
            container.setAttribute('data-lng', '2.2945');
            container.setAttribute('data-zoom', '13');
            container.setAttribute('data-provider', 'osm');

            const MapModalMock = require('../src/modules/map-modal.ts').default;

            module.editMapLocation(container);

            expect(MapModalMock).toHaveBeenCalledWith(
                module,
                expect.objectContaining({
                    lat: 48.8584,
                    lng: 2.2945,
                    title: 'Edit map location',
                    confirmLabel: 'Update Map',
                    onConfirm: expect.any(Function),
                })
            );
        });

        it('should update the container when the confirm callback runs', () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');
            container.setAttribute('data-lat', '48.8584');
            container.setAttribute('data-lng', '2.2945');
            container.setAttribute('data-zoom', '13');
            container.setAttribute('data-provider', 'osm');

            const MapModalMock = require('../src/modules/map-modal.ts').default;
            let onConfirm: ((lat: number, lng: number) => void) | null = null;
            (MapModalMock as jest.Mock).mockImplementation((_module, options) => {
                onConfirm = options.onConfirm;
                return { open: jest.fn() };
            });

            module.editMapLocation(container);
            onConfirm?.(48.8584, 2.2945);

            expect(container.getAttribute('data-lat')).toBe('48.8584');
            expect(container.getAttribute('data-lng')).toBe('2.2945');
            expect(mockQuill.update).toHaveBeenCalledWith('api');
        });
    });

    describe('updateMapLocation', () => {
        it('should update data attributes and persist via quill.update', () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');

            module.updateMapLocation(container, 10.5, -20.25);

            expect(container.getAttribute('data-lat')).toBe('10.5');
            expect(container.getAttribute('data-lng')).toBe('-20.25');
            expect(mockQuill.update).toHaveBeenCalledWith('api');
        });

        it('should move the live leaflet marker when an instance exists', async () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');

            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            await (module as any).initOsmMap(container, {
                lat: 1,
                lng: 2,
                zoom: 13,
                provider: 'osm',
                googleApiKey: null,
                tileUrl: null,
                height: '300px',
                scrollWheelZoom: true,
                draggable: true,
            });

            expect(errorSpy).not.toHaveBeenCalled();
            errorSpy.mockRestore();

            const L = await import('leaflet');
            expect(typeof (L as any).map).toBe('function');

            module.updateMapLocation(container, 5, 6);
            expect((L as any).map().setView).toHaveBeenCalledWith([5, 6]);
            expect((L as any).marker().setLatLng).toHaveBeenCalledWith([5, 6]);
            expect(container.getAttribute('data-lat')).toBe('5');
        });
    });

    describe('setupContainerInteraction', () => {
        const rect = {
            left: 0,
            top: 0,
            right: 100,
            bottom: 100,
            width: 100,
            height: 100,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect;

        it('should activate the map and prevent default when clicking inside', () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');
            container.getBoundingClientRect = () => rect;
            const mapDiv = document.createElement('div');
            const map = { invalidateSize: jest.fn() };
            document.body.appendChild(container);

            (module as any).setupContainerInteraction(container, mapDiv, map, 'leaflet');

            const event = new MouseEvent('mousedown', {
                clientX: 50,
                clientY: 50,
                bubbles: true,
                cancelable: true,
            });
            const preventDefault = jest.spyOn(event, 'preventDefault');
            document.dispatchEvent(event);

            expect(preventDefault).toHaveBeenCalled();
            expect(container.style.pointerEvents).toBe('auto');
            expect(mapDiv.style.pointerEvents).toBe('auto');
            expect(map.invalidateSize).toHaveBeenCalled();

            document.body.removeChild(container);
        });

        it('should deactivate the map when clicking outside', () => {
            const module = new MapModule(mockQuill, {});
            const container = document.createElement('div');
            container.getBoundingClientRect = () => rect;
            const mapDiv = document.createElement('div');
            document.body.appendChild(container);

            (module as any).setupContainerInteraction(container, mapDiv, {}, 'leaflet');

            const event = new MouseEvent('mousedown', {
                clientX: 200,
                clientY: 200,
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(event);

            expect(container.style.pointerEvents).toBe('none');
            expect(mapDiv.style.pointerEvents).toBe('none');

            document.body.removeChild(container);
        });
    });
});
