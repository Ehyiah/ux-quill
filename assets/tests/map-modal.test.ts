import MapModal from '../src/modules/map-modal';

jest.mock('../src/modules/map-utils.ts', () => ({
    loadScript: jest.fn().mockResolvedValue(undefined),
    injectLeafletStyles: jest.fn().mockResolvedValue(undefined),
}));

const fakeModule = {
    getMapOptions: jest.fn(() => ({ center: [48.8566, 2.3522] })),
    insertMap: jest.fn(),
};

describe('MapModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.querySelectorAll('.quill-map-modal').forEach((el) => el.remove());
    });

    it('should open the modal and call insertMap on confirm', async () => {
        const modal = new MapModal(fakeModule as any);
        await modal.open();

        const confirmBtn = document.querySelector('.quill-map-confirm');
        expect(confirmBtn).not.toBeNull();
        expect(document.querySelector('.quill-map-modal h3')!.textContent).toBe('Choose map location');

        (confirmBtn as HTMLButtonElement).click();

        expect(fakeModule.insertMap).toHaveBeenCalledWith(48.8566, 2.3522);
        expect(document.querySelector('.quill-map-modal')).toBeNull();
    });

    it('should call onConfirm instead of insertMap in edit mode', async () => {
        const onConfirm = jest.fn();
        const modal = new MapModal(fakeModule as any, {
            lat: 10,
            lng: 20,
            title: 'Edit map location',
            confirmLabel: 'Update Map',
            onConfirm,
        });
        await modal.open();

        expect(document.querySelector('.quill-map-modal h3')!.textContent).toBe('Edit map location');
        expect((document.querySelector('.quill-map-confirm') as HTMLButtonElement).textContent).toBe('Update Map');

        (document.querySelector('.quill-map-confirm') as HTMLButtonElement).click();

        expect(onConfirm).toHaveBeenCalledWith(10, 20);
        expect(fakeModule.insertMap).not.toHaveBeenCalled();
        expect(document.querySelector('.quill-map-modal')).toBeNull();
    });

    it('should prefill coordinates from options', async () => {
        const modal = new MapModal(fakeModule as any, { lat: 10, lng: 20 });
        await modal.open();

        expect(document.querySelector('.quill-map-coords')!.textContent).toContain('10.00000');
        expect(document.querySelector('.quill-map-coords')!.textContent).toContain('20.00000');
    });

    it('should fall back to module center when no options are provided', async () => {
        const modal = new MapModal(fakeModule as any);
        await modal.open();

        expect(document.querySelector('.quill-map-coords')!.textContent).toContain('48.85660');
        expect(document.querySelector('.quill-map-coords')!.textContent).toContain('2.35220');
    });

    it('should close on clicking the close button', async () => {
        const modal = new MapModal(fakeModule as any);
        await modal.open();

        (document.querySelector('.quill-map-close') as HTMLButtonElement).click();

        expect(document.querySelector('.quill-map-modal')).toBeNull();
        expect(fakeModule.insertMap).not.toHaveBeenCalled();
    });
});
