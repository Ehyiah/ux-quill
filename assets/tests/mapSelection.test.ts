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
        update: jest.fn(),
        on: jest.fn(),
    });

    const MockQuill = jest.fn().mockImplementation(() => createInstance());
    MockQuill.register = jest.fn();
    MockQuill.import = jest.fn().mockReturnValue({});
    MockQuill.find = jest.fn().mockReturnValue({ format: jest.fn() });

    return {
        __esModule: true,
        default: MockQuill,
    };
});

import MapSelection from '../src/modules/mapSelection';

describe('MapSelection', () => {
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
    let map: HTMLElement;

    beforeEach(() => {
        jest.clearAllMocks();
        document.head.querySelectorAll('style').forEach((el) => el.remove());

        mockQuill = new (Quill as any)();
        map = document.createElement('div');
        map.className = 'ql-map';
        map.getBoundingClientRect = () => rect;
        mockQuill.root.appendChild(map);
    });

    const selectMap = () => {
        map.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50, bubbles: true }));
    };

    const getToolbar = (): HTMLElement | null => mockQuill.container.querySelector('.ql-map-toolbar');

    it('should show the toolbar when a map is clicked', () => {
        new MapSelection(mockQuill);
        selectMap();

        expect(getToolbar()).not.toBeNull();
        expect(mockQuill.container.querySelector('.ql-map-overlay')).not.toBeNull();
        expect(map.classList.contains('ql-map-selected')).toBe(true);
    });

    it('should apply alignment to the blot when an align button is clicked', () => {
        const blot = { format: jest.fn() };
        (Quill as any).find.mockReturnValue(blot);

        new MapSelection(mockQuill);
        selectMap();

        const alignBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[data-align="center"]')!;
        alignBtn.click();

        expect(blot.format).toHaveBeenCalledWith('align', 'center');
        expect(mockQuill.update).toHaveBeenCalledWith('api');
    });

    it('should mark the active align button', () => {
        const blot = {
            format: jest.fn((name, value) => {
                if (value === 'center') {
                    map.style.float = 'none';
                    map.style.marginLeft = 'auto';
                    map.style.marginRight = 'auto';
                }
            }),
        };
        (Quill as any).find.mockReturnValue(blot);

        new MapSelection(mockQuill);
        selectMap();

        const alignBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[data-align="center"]')!;
        alignBtn.click();

        expect(alignBtn.classList.contains('active')).toBe(true);
    });

    it('should call mapModule.editMapLocation when the edit button is clicked', () => {
        const editMapLocation = jest.fn();
        mockQuill.getModule.mockReturnValue({ editMapLocation });

        new MapSelection(mockQuill);
        selectMap();

        const editBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[data-action="edit-location"]')!;
        editBtn.click();

        expect(editMapLocation.mock.calls[0][0]).toBe(map);
    });

    it('should delete the map when the delete button is clicked', () => {
        mockQuill.getIndex.mockReturnValue(3);

        new MapSelection(mockQuill);
        selectMap();

        const deleteBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[data-action="delete"]')!;
        deleteBtn.click();

        expect(mockQuill.deleteText).toHaveBeenCalledWith(3, 1, 'user');
        expect(getToolbar()).toBeNull();
    });

    it('should insert a paragraph before the map', () => {
        mockQuill.getIndex.mockReturnValue(3);

        new MapSelection(mockQuill);
        selectMap();

        const btnBefore = getToolbar()!.querySelector<HTMLButtonElement>('button[data-action="paragraph-before"]')!;
        btnBefore.click();

        expect(mockQuill.insertText).toHaveBeenCalledWith(3, '\n', 'user');
        expect(mockQuill.setSelection).toHaveBeenCalledWith(3, 0, 'user');
        expect(getToolbar()).toBeNull();
    });

    it('should insert a paragraph after the map', () => {
        mockQuill.getIndex.mockReturnValue(3);

        new MapSelection(mockQuill);
        selectMap();

        const btnAfter = getToolbar()!.querySelector<HTMLButtonElement>('button[data-action="paragraph-after"]')!;
        btnAfter.click();

        expect(mockQuill.insertText).toHaveBeenCalledWith(4, '\n', 'user');
        expect(mockQuill.setSelection).toHaveBeenCalledWith(5, 0, 'user');
        expect(getToolbar()).toBeNull();
    });

    it('should place the paragraph before button at the start and after button at the end of the toolbar', () => {
        new MapSelection(mockQuill);
        selectMap();

        const toolbar = getToolbar()!;
        const buttons = Array.from(toolbar.querySelectorAll('button'));
        const actions = buttons.map((btn) => (btn as HTMLElement).dataset.action);

        expect(actions[0]).toBe('paragraph-before');
        expect(actions[actions.length - 1]).toBe('paragraph-after');
    });

    it('should apply width when a size button is clicked', () => {
        const blot = { format: jest.fn() };
        (Quill as any).find.mockReturnValue(blot);

        new MapSelection(mockQuill);
        selectMap();

        const sizeBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[data-size="50%"]')!;
        sizeBtn.click();

        expect(blot.format).toHaveBeenCalledWith('width', '50%');
        expect(mockQuill.update).toHaveBeenCalledWith('api');
    });

    it('should apply custom width from the size input', () => {
        const blot = { format: jest.fn() };
        (Quill as any).find.mockReturnValue(blot);

        new MapSelection(mockQuill);
        selectMap();

        const customBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[title="Set custom width"]')!;
        customBtn.click();

        const inputBar = mockQuill.container.querySelector<HTMLDivElement>('.ql-map-input-bar')!;
        expect(inputBar).not.toBeNull();

        const input = inputBar.querySelector<HTMLInputElement>('input')!;
        input.value = '320';
        inputBar.querySelectorAll('button')[0].click();

        expect(blot.format).toHaveBeenCalledWith('width', '320px');
        expect(mockQuill.container.querySelector('.ql-map-input-bar')).toBeNull();
    });

    it('should cancel custom width input on cancel click', () => {
        new MapSelection(mockQuill);
        selectMap();

        const customBtn = getToolbar()!.querySelector<HTMLButtonElement>('button[title="Set custom width"]')!;
        customBtn.click();

        const inputBar = mockQuill.container.querySelector<HTMLDivElement>('.ql-map-input-bar')!;
        inputBar.querySelectorAll('button')[1].click();

        expect(mockQuill.container.querySelector('.ql-map-input-bar')).toBeNull();
    });

    it('should hide the toolbar when clicking outside the editor', () => {
        new MapSelection(mockQuill);
        selectMap();
        expect(getToolbar()).not.toBeNull();

        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(getToolbar()).toBeNull();
    });

    it('should keep the toolbar when mousedown happens inside the editor', () => {
        new MapSelection(mockQuill);
        selectMap();
        expect(getToolbar()).not.toBeNull();

        map.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(getToolbar()).not.toBeNull();
    });

    it('should deselect when clicking inside the editor but not on a map', () => {
        new MapSelection(mockQuill);
        selectMap();
        expect(getToolbar()).not.toBeNull();

        const paragraph = document.createElement('p');
        mockQuill.root.appendChild(paragraph);
        paragraph.dispatchEvent(new MouseEvent('click', { clientX: 500, clientY: 500, bubbles: true }));

        expect(getToolbar()).toBeNull();
        expect(map.classList.contains('ql-map-selected')).toBe(false);
    });
});
