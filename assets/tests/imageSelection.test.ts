import Quill from 'quill';

jest.mock('quill', () => {
    const createInstance = () => ({
        root: document.createElement('div'),
        container: document.createElement('div'),
        getModule: jest.fn().mockReturnValue(null),
        getIndex: jest.fn().mockReturnValue(0),
        deleteText: jest.fn(),
        insertText: jest.fn(),
        setSelection: jest.fn(),
        formatText: jest.fn(),
        update: jest.fn(),
        on: jest.fn(),
    });

    const MockQuill = jest.fn().mockImplementation(() => createInstance());
    MockQuill.register = jest.fn();
    MockQuill.import = jest.fn().mockReturnValue({});
    MockQuill.find = jest.fn().mockReturnValue({ format: jest.fn(), formats: jest.fn().mockReturnValue({}) });

    return {
        __esModule: true,
        default: MockQuill,
    };
});

import ImageSelection from '../src/modules/imageSelection';

describe('ImageSelection', () => {
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

    let mockQuill: any;

    beforeEach(() => {
        jest.clearAllMocks();
        document.head.querySelectorAll('style').forEach((el) => el.remove());

        mockQuill = new (Quill as any)();
    });

    const getToolbar = (): HTMLElement | null => mockQuill.container.querySelector('.ql-image-toolbar');

    const selectImage = (img: HTMLImageElement) => {
        img.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50, bubbles: true }));
    };

    it('should show the toolbar when a regular image is clicked', () => {
        const img = document.createElement('img');
        img.getBoundingClientRect = () => rect;
        mockQuill.root.appendChild(img);

        new ImageSelection(mockQuill);
        selectImage(img);

        expect(getToolbar()).not.toBeNull();
    });

    it('should not show the toolbar when clicking a map marker image', () => {
        const map = document.createElement('div');
        map.className = 'ql-map';
        const marker = document.createElement('img');
        marker.className = 'leaflet-marker-icon';
        marker.getBoundingClientRect = () => rect;
        map.appendChild(marker);
        mockQuill.root.appendChild(map);

        new ImageSelection(mockQuill);
        selectImage(marker);

        expect(getToolbar()).toBeNull();
        expect(marker.classList.contains('ql-image-selected')).toBe(false);
    });

    it('should deselect a selected image when clicking inside a map', () => {
        const img = document.createElement('img');
        img.getBoundingClientRect = () => rect;
        mockQuill.root.appendChild(img);

        const map = document.createElement('div');
        map.className = 'ql-map';
        const marker = document.createElement('img');
        marker.className = 'leaflet-marker-icon';
        marker.getBoundingClientRect = () => rect;
        map.appendChild(marker);
        mockQuill.root.appendChild(map);

        new ImageSelection(mockQuill);
        selectImage(img);
        expect(getToolbar()).not.toBeNull();

        selectImage(marker);

        expect(getToolbar()).toBeNull();
    });
});
