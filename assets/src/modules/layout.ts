import Quill from 'quill';
import LayoutBlot from '../blots/layout.ts';
import type { LayoutValue } from '../blots/layout.ts';

Quill.register(LayoutBlot);

export type LayoutPreset = {
    cols: number;
    ratios: string[];
    label: string;
};

export type LayoutOptions = {
    presets: LayoutPreset[];
    allow_wrap: boolean;
};

const DEFAULT_OPTIONS: LayoutOptions = {
    presets: [
        { cols: 2, ratios: ['1fr', '1fr'], label: '50/50' },
        { cols: 2, ratios: ['1fr', '2fr'], label: '30/70' },
        { cols: 2, ratios: ['2fr', '1fr'], label: '70/30' },
        { cols: 3, ratios: ['1fr', '1fr', '1fr'], label: '3 colonnes' },
    ],
    allow_wrap: true,
};

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'FIGURE', 'HR', 'PRE', 'DIV'];

export class Layout {
    private quill: Quill;
    private options: LayoutOptions;
    private dropdownEl: HTMLDivElement | null = null;
    private observers: MutationObserver[] = [];

    constructor(quill: Quill, userOptions: Partial<LayoutOptions> = {}) {
        this.quill = quill;
        this.options = { ...DEFAULT_OPTIONS, ...userOptions };

        this.injectStyles();
        this.setupToolbarHandler();
        this.setupKeyboardNav();
    }

    private injectStyles(): void {
        const id = 'quill-layout-editor-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-editor .ql-layout {
                position: relative;
            }
            .ql-editor .ql-layout-col {
                min-height: 48px;
                padding: 8px;
                border: 1px dashed #c0c0c0;
                border-radius: 4px;
                outline: none;
                transition: border-color 0.15s, box-shadow 0.15s;
            }
            .ql-editor .ql-layout-col:focus {
                border-color: #4a90d9;
                border-style: solid;
                box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);
            }
            .ql-editor .ql-layout-col p:first-child {
                margin-top: 0;
            }
            .ql-editor .ql-layout-col p:last-child {
                margin-bottom: 0;
            }
            .ql-layout-picker {
                position: fixed;
                z-index: 1000;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                padding: 4px 0;
                min-width: 140px;
            }
            .ql-layout-picker button {
                display: block;
                width: 100%;
                padding: 6px 16px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                line-height: 1.5;
            }
            .ql-layout-picker button:hover {
                background: #e8f0fe;
            }
            .ql-layout-picker button:active {
                background: #d2e3fc;
            }
        `;
        document.head.appendChild(style);
    }

    private setupToolbarHandler(): void {
        const toolbar = this.quill.getModule('toolbar');
        if (!toolbar) return;

        toolbar.addHandler('layout', this.onToolbarClick.bind(this));
    }

    private onToolbarClick(): void {
        const range = this.quill.getSelection(true);
        if (!range) return;

        const hasSelection = range.length > 0;

        if (hasSelection && this.options.allow_wrap) {
            this.showPresetPicker((preset) => {
                this.wrapSelection(range, preset);
            });
        } else {
            this.showPresetPicker((preset) => {
                this.insertEmptyLayout(range.index, preset);
            });
        }
    }

    private showPresetPicker(onSelect: (preset: LayoutPreset) => void): void {
        this.removeDropdown();

        const toolbar = this.quill.getModule('toolbar');
        let referenceEl: HTMLElement | null = null;

        if (toolbar) {
            const buttons = (toolbar as any).container?.querySelectorAll('button');
            if (buttons) {
                for (const btn of buttons) {
                    if (btn.classList.contains('ql-layout')) {
                        referenceEl = btn;
                        break;
                    }
                }
            }
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'ql-layout-picker';
        this.dropdownEl = dropdown;

        this.options.presets.forEach((preset) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = preset.label;
            btn.addEventListener('mousedown', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeDropdown();
                onSelect(preset);
            });
            dropdown.appendChild(btn);
        });

        document.body.appendChild(dropdown);

        // Position the dropdown below the toolbar button
        if (referenceEl) {
            const rect = referenceEl.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.left = `${rect.left}px`;
        } else {
            dropdown.style.top = '40px';
            dropdown.style.left = '0';
        }

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', this.onOutsideClick, { once: true });
        }, 0);
    }

    private onOutsideClick = (): void => {
        this.removeDropdown();
    };

    private removeDropdown(): void {
        if (this.dropdownEl) {
            this.dropdownEl.remove();
            this.dropdownEl = null;
        }
    }

    private insertEmptyLayout(index: number, preset: LayoutPreset): void {
        const value: LayoutValue = {
            cols: preset.cols,
            ratios: preset.ratios,
            columns: Array(preset.cols).fill('<p><br></p>'),
        };

        this.quill.insertEmbed(index, 'layout', value, 'user');
        this.quill.setSelection(index + 1, 'api');
        this.setupColumnSync();
    }

    private wrapSelection(range: { index: number; length: number }, preset: LayoutPreset): void {
        const delta = this.quill.getContents(range.index, range.length);
        const html = this.convertDeltaToHtml(delta);
        const splits = this.splitContent(html, preset.cols);

        this.quill.deleteText(range.index, range.length, 'user');

        const value: LayoutValue = {
            cols: preset.cols,
            ratios: preset.ratios,
            columns: splits,
        };

        this.quill.insertEmbed(range.index, 'layout', value, 'user');
        this.quill.setSelection(range.index + 1, 'api');
        this.setupColumnSync();
    }

    private convertDeltaToHtml(delta: any): string {
        const tempQuill = new Quill(document.createElement('div'));
        tempQuill.setContents(delta);
        return tempQuill.root.innerHTML;
    }

    private splitContent(html: string, cols: number): string[] {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        const blocks: Element[] = [];
        for (const child of temp.children) {
            if (BLOCK_TAGS.includes(child.tagName)) {
                blocks.push(child);
            }
        }

        if (blocks.length === 0) {
            const result = Array(cols).fill('<p><br></p>');
            result[0] = html || '<p><br></p>';
            return result;
        }

        // Round-robin distribution
        const columns: string[] = Array(cols).fill('');

        // If fewer blocks than columns, put all in column 0
        if (blocks.length < cols) {
            columns[0] = blocks.map(b => b.outerHTML).join('');
            for (let i = 1; i < cols; i++) {
                columns[i] = '<p><br></p>';
            }
            return columns;
        }

        for (let i = 0; i < blocks.length; i++) {
            const colIdx = i % cols;
            columns[colIdx] += blocks[i].outerHTML;
        }

        // Ensure each column has at least a paragraph
        for (let i = 0; i < cols; i++) {
            if (!columns[i] || columns[i].trim() === '') {
                columns[i] = '<p><br></p>';
            }
        }

        return columns;
    }

    private setupKeyboardNav(): void {
        this.quill.root.addEventListener('keydown', this.onKeyDown.bind(this), { capture: true });
    }

    private onKeyDown(e: KeyboardEvent): void {
        const activeCol = this.getActiveColumn();
        if (!activeCol) return;

        const cols = this.getAllColumns();
        if (cols.length === 0) return;

        const currentIndex = Array.from(cols).indexOf(activeCol);

        switch (e.key) {
            case 'Tab': {
                e.preventDefault();
                const nextIndex = e.shiftKey
                    ? (currentIndex - 1 + cols.length) % cols.length
                    : (currentIndex + 1) % cols.length;
                this.focusColumn(cols[nextIndex] as HTMLElement);
                break;
            }
            case 'ArrowUp': {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const isAtStart = range.startOffset === 0 && range.collapsed;
                    if (isAtStart && currentIndex > 0) {
                        e.preventDefault();
                        this.focusColumnEnd(cols[currentIndex - 1] as HTMLElement);
                    }
                }
                break;
            }
            case 'ArrowDown': {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const isAtEnd = this.isAtEndOfColumn(activeCol, range);
                    if (isAtEnd && currentIndex < cols.length - 1) {
                        e.preventDefault();
                        this.focusColumnStart(cols[currentIndex + 1] as HTMLElement);
                    }
                }
                break;
            }
            case 'Enter': {
                e.preventDefault();
                e.stopPropagation();

                if (e.shiftKey) {
                    this.insertLineBreak();
                } else {
                    this.insertNewParagraph();
                }
                break;
            }
        }
    }

    private getActiveColumn(): HTMLElement | null {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
        while (node) {
            if (node instanceof HTMLElement && node.classList.contains('ql-layout-col')) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    private getAllColumns(): NodeListOf<Element> {
        return this.quill.root.querySelectorAll('.ql-layout-col');
    }

    private focusColumn(col: HTMLElement): void {
        col.focus();
        const range = document.createRange();
        range.setStart(col, 0);
        range.collapse(true);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    private focusColumnEnd(col: HTMLElement): void {
        col.focus();
        const range = document.createRange();
        range.selectNodeContents(col);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    private focusColumnStart(col: HTMLElement): void {
        col.focus();
        const range = document.createRange();
        range.setStart(col, 0);
        range.collapse(true);
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    private isAtEndOfColumn(col: HTMLElement, range: Range): boolean {
        const lastChild = col.lastChild;
        if (!lastChild) return true;

        const colLength = col.textContent?.length || 0;
        return range.startOffset >= colLength - 1 || range.startContainer === lastChild;
    }

    private insertLineBreak(): void {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        range.deleteContents();

        const br = document.createElement('br');
        range.insertNode(br);

        range.setStartAfter(br);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private insertNewParagraph(): void {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);

        // Find the current block (closest <p> or the column itself)
        let block: Node | null = range.commonAncestorContainer;
        while (block && block.nodeType === Node.TEXT_NODE) {
            block = block.parentNode;
        }
        while (block && block instanceof HTMLElement && block.tagName !== 'P' && block.tagName !== 'DIV') {
            if (block.classList.contains('ql-layout-col')) break;
            block = block.parentNode;
        }

        if (!block || !(block instanceof HTMLElement)) {
            // Fallback: just insert a <br>
            this.insertLineBreak();
            return;
        }

        // Split text node at cursor if needed
        if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
            const textNode = range.startContainer;
            const splitText = textNode.splitText(range.startOffset);
            range.setStart(splitText, 0);
            range.collapse(true);
        }

        const newP = document.createElement('p');
        const br = document.createElement('br');
        newP.appendChild(br);

        if (block.parentNode) {
            block.parentNode.insertBefore(newP, block.nextSibling);
        }

        // Move cursor to new paragraph
        const newRange = document.createRange();
        newRange.setStart(newP, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }

    private setupColumnSync(): void {
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];

        const layouts = this.quill.root.querySelectorAll('.ql-layout');
        layouts.forEach((layout) => {
            const cols = layout.querySelectorAll('.ql-layout-col');
            cols.forEach((col) => {
                const observer = new MutationObserver(
                    this.debounce(() => this.syncLayoutContent(), 100)
                );
                observer.observe(col, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                });
                this.observers.push(observer);
            });
        });
    }

    private debounce(fn: () => void, delay: number): () => void {
        let timer: ReturnType<typeof setTimeout>;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    private syncLayoutContent(): void {
        const root = this.quill.root;
        const container = root.closest('[data-controller]');
        if (!container) return;

        const input = container.querySelector('[data-ehyiah--ux-quill--quill-target="input"]') as HTMLInputElement | null;
        if (!input) return;

        input.value = root.innerHTML;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    refreshSync(): void {
        this.setupColumnSync();
    }
}
