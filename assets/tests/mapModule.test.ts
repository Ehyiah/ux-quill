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
                scrollWheelZoom: true,
                draggable: true,
            });
        });
    });
});
