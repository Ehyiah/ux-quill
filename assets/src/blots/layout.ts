import Quill from 'quill';

const ContainerBlot = Quill.import('blots/container');
const BlockBlot = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/block/embed');

// In Quill 2.0, ContainerBlot extends ParentBlot extends ShadowBlot.
// Skip ParentBlot.optimize — it calls enforceAllowedChildren() and
// auto-removes empty blots. Go two levels up to ShadowBlot.optimize.
const parentBlotProto = Object.getPrototypeOf(ContainerBlot.prototype);
const shadowBlotProto = Object.getPrototypeOf(parentBlotProto);

export const EMPTY_COLUMN_HTML = '<p><br></p>';

const EMBED_SELECTOR = 'img, video, iframe, table, figure, hr, .ql-layout, .ql-divider, .ql-page-break, .ql-map';

export type LayoutValue = {
    cols: number;
    ratios: string[];
    columns: string[];
};

export function createColumnNode(index: number, html: string = EMPTY_COLUMN_HTML): HTMLElement {
    const col = document.createElement('div');
    col.className = 'ql-layout-col';
    col.dataset.colIndex = String(index);
    col.innerHTML = html && html.trim() !== '' ? html : EMPTY_COLUMN_HTML;

    return col;
}

export function applyRatios(node: HTMLElement, ratios: string[]): void {
    node.dataset.ratios = ratios.join('|');
    node.style.gridTemplateColumns = ratios.join(' ');
}

export function isColumnEmpty(col: Element | null | undefined): boolean {
    if (!col) return true;
    if ((col.textContent || '').trim() !== '') return false;

    return col.querySelector(EMBED_SELECTOR) === null;
}

export function isHtmlEmpty(html: string | null | undefined): boolean {
    if (!html || html.trim() === '') return true;

    const holder = document.createElement('div');
    holder.innerHTML = html;

    return isColumnEmpty(holder);
}

export function normalizeRatios(count: number): string[] {
    return Array.from({ length: count }, () => '1fr');
}

class LayoutColumnBlot extends ContainerBlot {
    static blotName = 'layout-column';
    static tagName = 'div';
    static className = 'ql-layout-col';

    static allowedChildren = [BlockBlot, BlockEmbed, ContainerBlot];

    optimize(context: Record<string, any>): void {
        shadowBlotProto.optimize.call(this, context);
    }
}

class LayoutBlot extends ContainerBlot {
    static blotName = 'layout';
    static tagName = 'div';
    static className = 'ql-layout';
    static allowedChildren = [LayoutColumnBlot];

    static create(value: LayoutValue): HTMLElement {
        const node = super.create();

        node.dataset.cols = String(value.cols);
        node.style.display = 'grid';
        node.style.gap = '16px';
        applyRatios(node, value.ratios);

        for (let i = 0; i < value.cols; i++) {
            node.appendChild(createColumnNode(i, value.columns[i]));
        }

        return node;
    }

    optimize(context: Record<string, any>): void {
        shadowBlotProto.optimize.call(this, context);
    }

    static value(node: HTMLElement): LayoutValue {
        const cols = node.querySelectorAll('.ql-layout-col');

        return {
            cols: parseInt(node.dataset.cols || '2', 10),
            ratios: (node.dataset.ratios || '1fr|1fr').split('|'),
            columns: Array.from(cols).map((c: Element) => (c as HTMLElement).innerHTML),
        };
    }
}

export { LayoutColumnBlot };
export default LayoutBlot;
