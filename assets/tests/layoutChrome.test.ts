import { Layout } from '../src/modules/layout';
import { LAYOUT_CHANGE_EVENT } from '../src/modules/layoutEvents';
import { serializeContent } from '../src/utils/serializeContent';

type Harness = {
    quill: any;
    layout: Layout;
    root: HTMLElement;
    container: HTMLElement;
};

const LAYOUT_HTML =
    '<div class="ql-layout" data-cols="2" data-ratios="1fr|1fr" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
    '<div class="ql-layout-col" data-col-index="0"><p>Left</p></div>' +
    '<div class="ql-layout-col" data-col-index="1"><p>Right</p></div>' +
    '</div>' +
    '<p><br></p>';

function createHarness(html: string = LAYOUT_HTML, editable = true): Harness {
    document.body.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'ql-editor';
    root.setAttribute('contenteditable', editable ? 'true' : 'false');
    root.innerHTML = html;

    const container = document.createElement('div');
    container.className = 'ql-container';
    container.appendChild(root);
    document.body.appendChild(container);

    const quill = {
        root,
        container,
        getModule: jest.fn().mockReturnValue(null),
        on: jest.fn(),
        insertEmbed: jest.fn(),
        getContents: jest.fn(),
        deleteText: jest.fn(),
        focus: jest.fn(),
        scroll: { build: jest.fn(), optimize: jest.fn() },
        emitter: { emit: jest.fn() },
    };

    const layout = new Layout(quill as any, {});

    return { quill, layout, root, container };
}

function layoutNode(harness: Harness): HTMLElement {
    return harness.root.querySelector('.ql-layout') as HTMLElement;
}

function columnsOf(harness: Harness): HTMLElement[] {
    return Array.from(harness.root.querySelectorAll<HTMLElement>('.ql-layout-col'));
}

function stubRect(element: HTMLElement, rect: { top: number; bottom: number; left: number; right: number }): void {
    element.getBoundingClientRect = () => ({
        ...rect,
        x: rect.left,
        y: rect.top,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top,
        toJSON: () => rect,
    }) as DOMRect;
}

function selectInColumn(harness: Harness, column: HTMLElement): void {
    const target = column.querySelector('p')?.firstChild ?? column;
    const range = document.createRange();
    range.setStart(target, 0);
    range.collapse(true);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    (harness.layout as any).updateActiveColumn();
}

describe('Layout module', () => {
    let harness: Harness | null = null;

    afterEach(() => {
        harness?.layout.destroy();
        harness = null;
        jest.useRealTimers();
    });

    it('changes ratios without rebuilding the editor', () => {
        harness = createHarness();
        const node = layoutNode(harness);

        harness.layout.applyPreset(node, { cols: 2, ratios: ['2fr', '1fr'], label: '70/30' });

        expect(layoutNode(harness).dataset.ratios).toBe('2fr|1fr');
        expect(layoutNode(harness).style.gridTemplateColumns).toBe('2fr 1fr');
        expect(harness.quill.scroll.build).not.toHaveBeenCalled();
        expect(harness.quill.emitter.emit).toHaveBeenCalledWith(LAYOUT_CHANGE_EVENT, expect.any(Object));
    });

    it('adds a column after the active one and keeps existing content', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        selectInColumn(harness, columnsOf(harness)[1]);

        const updated = harness.layout.addColumn(layoutNode(harness), 1)!;

        expect(updated.dataset.cols).toBe('4');
        expect(updated.dataset.ratios).toBe('1fr|1fr|1fr|1fr');
        expect(Array.from(updated.querySelectorAll('.ql-layout-col')).map((col) => col.innerHTML)).toEqual([
            '<p>A</p>',
            '<p>B</p>',
            '<p><br></p>',
            '<p>C</p>',
        ]);
    });

    it('merges removed column content into its neighbour', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        const updated = harness.layout.removeColumn(layoutNode(harness), 1)!;

        expect(updated.dataset.cols).toBe('2');
        expect(Array.from(updated.querySelectorAll('.ql-layout-col')).map((col) => col.innerHTML)).toEqual([
            '<p>A</p><p>B</p>',
            '<p>C</p>',
        ]);
    });

    it('refuses to drop below two columns', () => {
        harness = createHarness();
        const node = layoutNode(harness);

        harness.layout.removeColumn(node, 0);

        expect(columnsOf(harness)).toHaveLength(2);
    });

    it('merges overflow into the last column when a preset shrinks the layout', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        harness.layout.applyPreset(layoutNode(harness), { cols: 2, ratios: ['1fr', '1fr'], label: '50/50' });

        expect(Array.from(columnsOf(harness)).map((col) => col.innerHTML)).toEqual(['<p>A</p>', '<p>B</p><p>C</p>']);
    });

    it('duplicates a layout right after itself', () => {
        harness = createHarness();

        const copy = harness.layout.duplicateLayout(layoutNode(harness))!;

        expect(harness.root.querySelectorAll('.ql-layout')).toHaveLength(2);
        expect(copy.innerHTML).toBe(columnsOf(harness)[1].parentElement!.innerHTML);
        expect(copy.querySelectorAll('.ql-layout-col')).toHaveLength(2);
    });

    it('unwraps a layout and keeps its content', () => {
        harness = createHarness();

        harness.layout.unwrapLayout(layoutNode(harness));

        expect(harness.root.querySelector('.ql-layout')).toBeNull();
        expect(harness.root.innerHTML).toBe('<p>Left</p><p>Right</p><p><br></p>');
    });

    it('strips editor-only column classes when serializing', () => {
        harness = createHarness();
        const column = columnsOf(harness)[0];

        column.classList.add('ql-layout-col--active');
        column.classList.add('ql-layout-col--empty');

        const html = serializeContent(harness.root);

        expect(html).not.toContain('ql-layout-col--active');
        expect(html).not.toContain('ql-layout-col--empty');
        expect(html).toContain('class="ql-layout-col"');
    });
});

describe('Layout chrome', () => {
    let harness: Harness;

    function chromeEl(): HTMLElement {
        return harness.container.querySelector('.ql-layout-chrome') as HTMLElement;
    }

    function hoverLayout(): void {
        columnsOf(harness)[0].dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
    }

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        harness.layout.destroy();
        jest.useRealTimers();
    });

    it('appears after the hover delay and displays the layout summary', () => {
        harness = createHarness();

        hoverLayout();
        expect(chromeEl().hidden).toBe(true);

        jest.advanceTimersByTime(200);

        expect(chromeEl().hidden).toBe(false);
        expect(chromeEl().querySelector('.ql-layout-chrome__badge')?.textContent).toBe('2 columns · 50/50');
    });

    it('never shows on a read-only editor', () => {
        harness = createHarness(LAYOUT_HTML, false);

        hoverLayout();
        jest.advanceTimersByTime(200);

        expect(chromeEl().hidden).toBe(true);
    });

    it('hides on Escape', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(chromeEl().hidden).toBe(true);
    });

    it('stays visible while the pointer crosses the gap between the layout and the toolbar', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);

        const chrome = chromeEl();
        stubRect(layoutNode(harness), { top: 100, bottom: 300, left: 0, right: 400 });
        stubRect(chrome, { top: 56, bottom: 80, left: 300, right: 400 });

        // Pointer in the 20px gap between the layout and the floating toolbar.
        document.dispatchEvent(new MouseEvent('pointermove', { clientX: 350, clientY: 90, bubbles: true }));
        jest.advanceTimersByTime(500);

        expect(chrome.hidden).toBe(false);
    });

    it('hides once the pointer leaves both the layout and the toolbar', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);

        const chrome = chromeEl();
        stubRect(layoutNode(harness), { top: 100, bottom: 300, left: 0, right: 400 });
        stubRect(chrome, { top: 56, bottom: 80, left: 300, right: 400 });

        document.dispatchEvent(new MouseEvent('pointermove', { clientX: 1200, clientY: 900, bubbles: true }));
        jest.advanceTimersByTime(500);

        expect(chrome.hidden).toBe(true);
    });

    it('opens a preset menu listing every preset', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);

        (chromeEl().querySelector('button[data-action="presets"]') as HTMLButtonElement).click();

        const items = harness.container.querySelectorAll('.ql-layout-menu__item');

        expect(items).toHaveLength(4);
        expect(items[0].textContent).toContain('50/50');
    });

    it('opens the preset menu and applies the chosen layout', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        hoverLayout();
        jest.advanceTimersByTime(200);
        (chromeEl().querySelector('button[data-action="presets"]') as HTMLButtonElement).click();

        (harness.container.querySelectorAll('.ql-layout-menu__item')[0] as HTMLButtonElement).click();

        expect(layoutNode(harness).dataset.cols).toBe('2');
        expect(layoutNode(harness).dataset.ratios).toBe('1fr|1fr');
    });

    it('removes an empty column without confirmation', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p><br></p></div>' +
                '</div>'
        );

        hoverLayout();
        jest.advanceTimersByTime(200);
        selectInColumn(harness, columnsOf(harness)[2]);

        (chromeEl().querySelector('button[data-action="remove"]') as HTMLButtonElement).click();

        expect(layoutNode(harness).dataset.cols).toBe('2');
        expect((chromeEl().querySelector('.ql-layout-chrome__confirm') as HTMLElement).hidden).toBe(true);
    });

    it('asks for confirmation before removing a column with content', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        hoverLayout();
        jest.advanceTimersByTime(200);
        selectInColumn(harness, columnsOf(harness)[0]);

        (chromeEl().querySelector('button[data-action="remove"]') as HTMLButtonElement).click();

        const confirm = chromeEl().querySelector('.ql-layout-chrome__confirm') as HTMLElement;
        expect(confirm.hidden).toBe(false);
        expect(layoutNode(harness).dataset.cols).toBe('3');

        (confirm.querySelector('button[data-confirm="ok"]') as HTMLButtonElement).click();

        expect(layoutNode(harness).dataset.cols).toBe('2');
        expect(columnsOf(harness)[0].innerHTML).toContain('<p>A</p>');
        expect(columnsOf(harness)[0].innerHTML).toContain('<p>B</p>');
    });

    it('keeps the column when the confirmation is cancelled', () => {
        harness = createHarness(
            '<div class="ql-layout" data-cols="3" data-ratios="1fr|1fr|1fr">' +
                '<div class="ql-layout-col" data-col-index="0"><p>A</p></div>' +
                '<div class="ql-layout-col" data-col-index="1"><p>B</p></div>' +
                '<div class="ql-layout-col" data-col-index="2"><p>C</p></div>' +
                '</div>'
        );

        hoverLayout();
        jest.advanceTimersByTime(200);
        selectInColumn(harness, columnsOf(harness)[0]);

        (chromeEl().querySelector('button[data-action="remove"]') as HTMLButtonElement).click();
        const confirm = chromeEl().querySelector('.ql-layout-chrome__confirm') as HTMLElement;
        (confirm.querySelector('button[data-confirm="cancel"]') as HTMLButtonElement).click();

        expect(confirm.hidden).toBe(true);
        expect(layoutNode(harness).dataset.cols).toBe('3');
    });

    it('duplicates and unwraps the layout from the chrome', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);
        (chromeEl().querySelector('button[data-action="duplicate"]') as HTMLButtonElement).click();

        expect(harness.root.querySelectorAll('.ql-layout')).toHaveLength(2);

        (chromeEl().querySelector('button[data-action="unwrap"]') as HTMLButtonElement).click();

        expect(harness.root.querySelectorAll('.ql-layout')).toHaveLength(1);
    });

    it('does not leak chrome markup into the editor content', () => {
        harness = createHarness();

        hoverLayout();
        jest.advanceTimersByTime(200);

        expect(harness.root.innerHTML).not.toContain('ql-layout-chrome');
        expect(harness.quill.emitter.emit).not.toHaveBeenCalled();
    });
});
