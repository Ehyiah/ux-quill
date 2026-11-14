import Quill from 'quill';
import LayoutBlot, {
    LayoutColumnBlot,
    applyRatios,
    isColumnEmpty,
    isHtmlEmpty,
    normalizeRatios,
    EMPTY_COLUMN_HTML,
} from '../blots/layout.ts';
import type { LayoutValue } from '../blots/layout.ts';
import { LayoutChrome } from './layoutChrome.ts';
import { LAYOUT_CHANGE_EVENT } from './layoutEvents.ts';
import { serializeHtml } from '../utils/serializeContent.ts';

Quill.register(LayoutBlot);
Quill.register(LayoutColumnBlot);

export type LayoutPreset = {
    cols: number;
    ratios: string[];
    label: string;
};

export type LayoutOptions = {
    presets: LayoutPreset[];
    allow_wrap: boolean;
    ui?: boolean;
    show_badge?: boolean;
};

const DEFAULT_OPTIONS: LayoutOptions = {
    presets: [
        { cols: 2, ratios: ['1fr', '1fr'], label: '50/50' },
        { cols: 2, ratios: ['1fr', '2fr'], label: '30/70' },
        { cols: 2, ratios: ['2fr', '1fr'], label: '70/30' },
        { cols: 3, ratios: ['1fr', '1fr', '1fr'], label: '3 columns' },
    ],
    allow_wrap: true,
    ui: true,
    show_badge: true,
};

const ACTIVE_COLUMN_CLASS = 'ql-layout-col--active';
const EMPTY_COLUMN_CLASS = 'ql-layout-col--empty';

export class Layout {
    private quill: Quill;
    private options: LayoutOptions;
    private dropdownEl: HTMLDivElement | null = null;
    private chrome: LayoutChrome | null = null;
    private activeColumnEl: HTMLElement | null = null;
    private selectionFrame: number | null = null;
    private emptyFrame: number | null = null;

    constructor(quill: Quill, userOptions: Partial<LayoutOptions> = {}) {
        this.quill = quill;
        this.options = { ...DEFAULT_OPTIONS, ...userOptions };

        this.injectStyles();
        this.setupToolbarHandler();
        this.setupTabNavigation();
        this.setupActiveColumnTracking();
        this.setupEmptyColumnTracking();

        if (this.options.ui !== false) {
            this.chrome = new LayoutChrome(quill, this, {
                showBadge: this.options.show_badge !== false,
            });
            this.chrome.mount();
        }
    }

    private injectStyles(): void {
        const id = 'quill-layout-editor-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-editor .ql-layout {
                position: relative;
                border-radius: 4px;
                transition: outline-color 0.15s ease;
            }
            .ql-editor .ql-layout:hover,
            .ql-editor .ql-layout:focus-within {
                outline: 1px solid rgba(74, 144, 217, 0.55);
                outline-offset: 4px;
            }
            .ql-editor .ql-layout-col {
                position: relative;
                min-height: 48px;
                padding: 8px;
                border: 1px dashed #c0c0c0;
                border-radius: 4px;
                outline: none;
                transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
            }
            .ql-editor .ql-layout-col:hover {
                background-color: rgba(74, 144, 217, 0.03);
            }
            .ql-editor .ql-layout-col--active {
                border-color: #4a90d9;
                border-style: solid;
                box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);
            }
            .ql-editor .ql-layout-col--empty::before {
                content: "Empty column — click to write";
                position: absolute;
                top: 8px;
                left: 10px;
                right: 10px;
                color: #9aa0a6;
                font-size: 13px;
                font-style: italic;
                pointer-events: none;
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
            .ql-layout-chrome {
                position: fixed;
                z-index: 1002;
                display: inline-flex;
                align-items: center;
                gap: 2px;
                padding: 2px;
                background: #fff;
                border: 1px solid #d3d6da;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 11px;
                line-height: 1;
                color: #444;
            }
            .ql-layout-chrome[hidden] {
                display: none;
            }
            .ql-layout-chrome__badge {
                padding: 0 6px;
                color: #5f6368;
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
                border-right: 1px solid #e3e5e8;
            }
            .ql-layout-chrome__badge[hidden] {
                display: none;
            }
            .ql-layout-chrome__btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                padding: 0 4px;
                border: none;
                border-radius: 4px;
                background: none;
                color: #3c4043;
                cursor: pointer;
            }
            .ql-layout-chrome__btn--presets {
                gap: 3px;
            }
            .ql-layout-chrome__caret {
                display: inline-flex;
            }
            .ql-layout-chrome__btn:hover:not(:disabled) {
                background: #eef2f7;
            }
            .ql-layout-chrome__btn:active:not(:disabled) {
                background: #e0e7f0;
            }
            .ql-layout-chrome__btn:focus-visible {
                outline: 2px solid #4a90d9;
                outline-offset: 1px;
            }
            .ql-layout-chrome__btn:disabled {
                opacity: 0.35;
                cursor: default;
            }
            .ql-layout-chrome__btn--danger {
                color: #b3261e;
            }
            .ql-layout-chrome__confirm {
                position: absolute;
                top: calc(100% + 6px);
                z-index: 1003;
                right: 0;
                width: 220px;
                padding: 10px;
                background: #fff;
                border: 1px solid #d3d6da;
                border-radius: 6px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #3c4043;
            }
            .ql-layout-chrome__confirm[hidden] {
                display: none;
            }
            .ql-layout-chrome__confirm-text {
                margin: 0 0 8px;
            }
            .ql-layout-chrome__confirm-actions {
                display: flex;
                justify-content: flex-end;
                gap: 6px;
            }
            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn {
                min-width: auto;
                height: 26px;
                padding: 0 10px;
                font-size: 12px;
                border: 1px solid #d3d6da;
            }
            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn--danger {
                border-color: transparent;
                background: #b3261e;
                color: #fff;
            }
            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn--danger:hover {
                background: #8c1d17;
            }
            .ql-layout-menu {
                position: fixed;
                z-index: 1003;
                min-width: 160px;
                padding: 4px;
                background: #fff;
                border: 1px solid #d3d6da;
                border-radius: 6px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .ql-layout-menu__item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 6px 8px;
                border: none;
                border-radius: 4px;
                background: none;
                cursor: pointer;
                font-size: 12px;
                color: #3c4043;
                text-align: left;
            }
            .ql-layout-menu__item:hover,
            .ql-layout-menu__item:focus-visible {
                background: #eef2f7;
                outline: none;
            }
            .ql-layout-menu__bars {
                display: inline-flex;
                gap: 2px;
                width: 28px;
                height: 12px;
                flex: 0 0 auto;
            }
            .ql-layout-menu__bar {
                background: #c6cbd1;
                border-radius: 1px;
            }
            .ql-layout-visually-hidden {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0 0 0 0);
                white-space: nowrap;
                border: 0;
            }
            @media (prefers-reduced-motion: reduce) {
                .ql-editor .ql-layout,
                .ql-editor .ql-layout-col {
                    transition: none;
                }
            }
            @media print {
                .ql-layout-chrome,
                .ql-layout-chrome__confirm,
                .ql-layout-menu,
                .ql-layout-picker {
                    display: none !important;
                }
                .ql-editor .ql-layout-col--empty::before {
                    content: none !important;
                }
                .ql-editor .ql-layout {
                    outline: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    private setupToolbarHandler(): void {
        const toolbar = this.quill.getModule('toolbar');
        if (!toolbar) return;

        const button = toolbar.container?.querySelector('button.ql-layout');
        button?.setAttribute('title', 'Layout');
        button?.setAttribute('aria-label', 'Layout');

        toolbar.addHandler('layout', this.onToolbarClick.bind(this));
    }

    private onToolbarClick(): void {
        const range = this.quill.getSelection(true);
        if (!range) return;

        if (range.length > 0 && this.options.allow_wrap) {
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

        if (referenceEl) {
            const rect = referenceEl.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 4}px`;
            dropdown.style.left = `${rect.left}px`;
        } else {
            dropdown.style.top = '40px';
            dropdown.style.left = '0';
        }

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
            columns: Array(preset.cols).fill(EMPTY_COLUMN_HTML),
        };

        this.quill.insertEmbed(index, 'layout', value, 'user');
        this.markEmptyColumns();
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
        this.markEmptyColumns();
    }

    private convertDeltaToHtml(delta: any): string {
        const tempQuill = new Quill(document.createElement('div'));
        tempQuill.setContents(delta);

        return tempQuill.root.innerHTML;
    }

    private splitContent(html: string, cols: number): string[] {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        const blocks = Array.from(temp.children) as HTMLElement[];

        if (blocks.length === 0) {
            const result = Array(cols).fill(EMPTY_COLUMN_HTML);
            result[0] = html || EMPTY_COLUMN_HTML;

            return result;
        }

        const columns: string[] = Array(cols).fill('');

        if (blocks.length < cols) {
            columns[0] = blocks.map((b) => b.outerHTML).join('');
            for (let i = 1; i < cols; i++) {
                columns[i] = EMPTY_COLUMN_HTML;
            }

            return columns;
        }

        for (let i = 0; i < blocks.length; i++) {
            columns[i % cols] += blocks[i].outerHTML;
        }

        for (let i = 0; i < cols; i++) {
            if (!columns[i] || columns[i].trim() === '') {
                columns[i] = EMPTY_COLUMN_HTML;
            }
        }

        return columns;
    }

    private setupTabNavigation(): void {
        this.quill.root.addEventListener('keydown', this.onTabKey.bind(this), { capture: true });
    }

    private onTabKey(e: KeyboardEvent): void {
        if (e.key !== 'Tab') return;

        const activeCol = this.getActiveColumnElement();
        if (!activeCol) return;

        e.preventDefault();

        const cols = this.getAllColumns();
        if (cols.length === 0) return;

        const currentIndex = Array.from(cols).indexOf(activeCol);
        const nextIndex = e.shiftKey
            ? (currentIndex - 1 + cols.length) % cols.length
            : (currentIndex + 1) % cols.length;

        this.focusColumn(cols[nextIndex] as HTMLElement);
    }

    private setupActiveColumnTracking(): void {
        document.addEventListener('selectionchange', this.onSelectionChange);
    }

    private onSelectionChange = (): void => {
        if (this.selectionFrame !== null) return;

        this.selectionFrame = window.requestAnimationFrame(() => {
            this.selectionFrame = null;
            this.updateActiveColumn();
        });
    };

    private updateActiveColumn(): void {
        const column = this.getActiveColumnElement();

        if (column !== this.activeColumnEl) {
            this.activeColumnEl?.classList.remove(ACTIVE_COLUMN_CLASS);
            this.activeColumnEl = column;
            column?.classList.add(ACTIVE_COLUMN_CLASS);
        }

        this.chrome?.handleActiveColumnChange(column);
    }

    private setupEmptyColumnTracking(): void {
        this.markEmptyColumns();

        if (typeof this.quill.on !== 'function') return;

        this.quill.on('text-change', () => this.scheduleEmptyMark());
    }

    private scheduleEmptyMark(): void {
        if (this.emptyFrame !== null) return;

        this.emptyFrame = window.requestAnimationFrame(() => {
            this.emptyFrame = null;
            this.markEmptyColumns();
        });
    }

    private markEmptyColumns(): void {
        const root = this.quill.root as HTMLElement;
        root.querySelectorAll('.ql-layout-col').forEach((column) => {
            column.classList.toggle(EMPTY_COLUMN_CLASS, isColumnEmpty(column));
        });
    }

    private getActiveColumnElement(): HTMLElement | null {
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

    private focusColumn(col: HTMLElement | null): void {
        if (!col) return;

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

    // ---------------------------------------------------------------------
    // Public API — used by the layout chrome
    // ---------------------------------------------------------------------

    getPresets(): LayoutPreset[] {
        return this.options.presets;
    }

    findLayout(target: Element | Node | null): HTMLElement | null {
        if (!target) return null;

        const element = target instanceof Element ? target : (target.parentElement as Element | null);

        return (element?.closest('.ql-layout') as HTMLElement | null) ?? null;
    }

    getLayoutValue(layoutNode: HTMLElement): LayoutValue {
        return LayoutBlot.value(layoutNode);
    }

    getColumnElements(layoutNode: HTMLElement): HTMLElement[] {
        return Array.from(layoutNode.querySelectorAll<HTMLElement>('.ql-layout-col'));
    }

    getActiveColumnIndex(layoutNode: HTMLElement): number {
        const column = this.getActiveColumnElement();
        if (!column || !layoutNode.contains(column)) return -1;

        return this.getColumnElements(layoutNode).indexOf(column);
    }

    isColumnEmpty(column: HTMLElement | null | undefined): boolean {
        return isColumnEmpty(column);
    }

    /**
     * Changes the column ratios without touching the column contents.
     * Returns the (unchanged) layout node.
     */
    applyPreset(layoutNode: HTMLElement, preset: LayoutPreset): HTMLElement | null {
        const current = LayoutBlot.value(layoutNode);

        if (preset.cols === current.cols) {
            applyRatios(layoutNode, preset.ratios);
            this.markEmptyColumns();
            this.emitLayoutChange(layoutNode);
            this.chrome?.refresh();

            return layoutNode;
        }

        const columns = this.reshapeColumns(current.columns, preset.cols);
        const value: LayoutValue = { cols: preset.cols, ratios: preset.ratios, columns };
        const activeIndex = this.getActiveColumnIndex(layoutNode);
        const focusIndex = activeIndex >= 0 ? Math.min(activeIndex, preset.cols - 1) : 0;

        return this.replaceLayout(layoutNode, value, focusIndex);
    }

    addColumn(layoutNode: HTMLElement, afterIndex?: number): HTMLElement | null {
        const current = LayoutBlot.value(layoutNode);
        const anchor = typeof afterIndex === 'number' ? afterIndex : current.cols - 1;
        const insertAt = Math.min(Math.max(anchor, -1), current.cols - 1) + 1;

        const columns = [...current.columns];
        columns.splice(insertAt, 0, EMPTY_COLUMN_HTML);

        const ratios = [...current.ratios];
        ratios.splice(Math.min(insertAt, ratios.length), 0, '1fr');

        return this.replaceLayout(
            layoutNode,
            { cols: columns.length, ratios: this.ensureRatioCount(ratios, columns.length), columns },
            insertAt
        );
    }

    removeColumn(layoutNode: HTMLElement, index: number): HTMLElement | null {
        const current = LayoutBlot.value(layoutNode);
        if (current.cols <= 2 || index < 0 || index >= current.cols) return layoutNode;

        const columns = [...current.columns];
        const removed = columns.splice(index, 1)[0];
        const targetIndex = index > 0 ? index - 1 : 0;

        if (!isHtmlEmpty(removed)) {
            columns[targetIndex] = index === 0
                ? removed + columns[targetIndex]
                : columns[targetIndex] + removed;
        }

        const ratios = [...current.ratios];
        ratios.splice(index, 1);

        return this.replaceLayout(
            layoutNode,
            { cols: columns.length, ratios: this.ensureRatioCount(ratios, columns.length), columns },
            targetIndex
        );
    }

    duplicateLayout(layoutNode: HTMLElement): HTMLElement | null {
        const value = LayoutBlot.value(layoutNode);
        const layouts = Array.from(this.quill.root.querySelectorAll<HTMLElement>('.ql-layout'));
        const ordinal = layouts.indexOf(layoutNode);

        const copy = LayoutBlot.create(value);
        layoutNode.after(copy);

        this.rebuildEditor();

        const rebuilt = this.quill.root.querySelectorAll<HTMLElement>('.ql-layout')[ordinal + 1] ?? null;
        this.markEmptyColumns();
        this.emitLayoutChange(rebuilt);

        if (rebuilt) {
            this.focusColumn(this.getColumnElements(rebuilt)[0] ?? null);
        }

        return rebuilt;
    }

    unwrapLayout(layoutNode: HTMLElement): HTMLElement | null {
        const value = LayoutBlot.value(layoutNode);
        const holder = document.createElement('div');
        holder.innerHTML = value.columns.join('');

        const fragment = document.createDocumentFragment();
        Array.from(holder.childNodes).forEach((child) => fragment.appendChild(child));

        layoutNode.replaceWith(fragment);

        this.rebuildEditor();
        this.markEmptyColumns();
        this.emitLayoutChange(null);

        return null;
    }

    private reshapeColumns(columns: string[], targetCols: number): string[] {
        const next = columns.slice(0, Math.max(targetCols, 0));

        while (next.length < targetCols) {
            next.push(EMPTY_COLUMN_HTML);
        }

        if (columns.length > targetCols) {
            const overflow = columns.slice(targetCols).filter((html) => !isHtmlEmpty(html));

            if (overflow.length > 0 && next.length > 0) {
                const last = next.length - 1;
                next[last] = next[last] + overflow.join('');
            }
        }

        return next.map((html) => (isHtmlEmpty(html) ? EMPTY_COLUMN_HTML : html));
    }

    private ensureRatioCount(ratios: string[], count: number): string[] {
        const next = ratios.slice(0, count);
        while (next.length < count) {
            next.push('1fr');
        }

        return next.every((ratio) => /^\d*\.?\d+fr$/.test(ratio)) ? next : normalizeRatios(count);
    }

    private replaceLayout(layoutNode: HTMLElement, value: LayoutValue, focusIndex: number): HTMLElement | null {
        const layouts = Array.from(this.quill.root.querySelectorAll<HTMLElement>('.ql-layout'));
        const ordinal = Math.max(0, layouts.indexOf(layoutNode));

        const replacement = LayoutBlot.create(value);
        layoutNode.replaceWith(replacement);

        this.rebuildEditor();

        const rebuilt = this.quill.root.querySelectorAll<HTMLElement>('.ql-layout')[ordinal] ?? null;
        this.markEmptyColumns();
        this.emitLayoutChange(rebuilt);

        if (rebuilt) {
            this.focusColumn(this.getColumnElements(rebuilt)[focusIndex] ?? null);
        }

        return rebuilt;
    }

    private rebuildEditor(): void {
        const root = this.quill.root as HTMLElement;
        root.innerHTML = serializeHtml(root.innerHTML);

        const scroll = (this.quill as any).scroll;
        if (typeof scroll?.build === 'function') {
            scroll.build();
            scroll.optimize?.();
        }
    }

    private emitLayoutChange(layoutNode: HTMLElement | null): void {
        const emitter = (this.quill as any).emitter;
        if (typeof emitter?.emit !== 'function') return;

        emitter.emit(LAYOUT_CHANGE_EVENT, {
            node: layoutNode,
            value: layoutNode ? LayoutBlot.value(layoutNode) : null,
        });
    }

    destroy(): void {
        document.removeEventListener('selectionchange', this.onSelectionChange);
        this.chrome?.destroy();
        this.chrome = null;

        if (this.selectionFrame !== null) {
            window.cancelAnimationFrame(this.selectionFrame);
            this.selectionFrame = null;
        }
        if (this.emptyFrame !== null) {
            window.cancelAnimationFrame(this.emptyFrame);
            this.emptyFrame = null;
        }
    }
}
