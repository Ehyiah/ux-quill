jest.mock('@hotwired/stimulus', () => ({
    Controller: class {},
}));

jest.mock('../src/modules/map-utils.ts', () => ({
    injectLeafletStyles: jest.fn().mockResolvedValue(undefined),
    loadScript: jest.fn().mockResolvedValue(undefined),
    buildLeafletIcon: jest.fn(() => ({})),
    buildGoogleMarkerOptions: jest.fn(() => ({})),
}));

describe('map-init', () => {
    let map: HTMLDivElement;

    beforeEach(() => {
        jest.resetModules();
        document.body.querySelectorAll('.ql-map').forEach((el) => el.remove());
        map = document.createElement('div');
        map.className = 'ql-map';
        map.setAttribute('data-provider', 'osm');
        map.style.height = '200px';
        document.body.appendChild(map);
    });

    afterEach(() => {
        map.remove();
    });

    it('dispatches before-init and initialized events on success', async () => {
        const { initQuillMaps } = await import('../src/map-init');

        const beforeInit = jest.fn();
        const initialized = jest.fn();
        map.addEventListener('ux-quill:map:before-init', beforeInit);
        map.addEventListener('ux-quill:map:initialized', initialized);

        await initQuillMaps();

        expect(beforeInit).toHaveBeenCalledTimes(1);
        expect(initialized).toHaveBeenCalledTimes(1);
        const initializedDetail = (initialized.mock.calls[0][0] as CustomEvent).detail;
        expect(initializedDetail.options).toMatchObject({ provider: 'osm', lat: 48.8566, zoom: 13, marker: null });
    });

    it('dispatches error event when initialization fails', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const L = await import('leaflet');
        (L as any).map.mockImplementation(() => {
            throw new Error('boom');
        });

        const { initQuillMaps } = await import('../src/map-init');

        const error = jest.fn();
        map.addEventListener('ux-quill:map:error', error);

        await initQuillMaps();

        expect(error).toHaveBeenCalledTimes(1);
        const errorDetail = (error.mock.calls[0][0] as CustomEvent).detail;
        expect(errorDetail.options).toMatchObject({ provider: 'osm', lat: 48.8566 });
        expect(errorDetail.message).toBe('Failed to load map');
        errorSpy.mockRestore();
    });

    it('dispatches maps:completed on the controller element after initialization', async () => {
        const { default: QuillMapsController } = await import('../src/map-init');

        const element = document.createElement('div');
        document.body.appendChild(element);
        const completed = jest.fn();
        element.addEventListener('ux-quill:maps:completed', completed);

        const controller = new QuillMapsController();
        (controller as any).element = element;
        controller.connect();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(completed).toHaveBeenCalledTimes(1);
        element.remove();
    });
});
