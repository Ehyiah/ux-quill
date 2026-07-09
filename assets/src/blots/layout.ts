import Quill from 'quill';

const ContainerBlot = Quill.import('blots/container');
const BlockBlot = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/block/embed');

// In Quill 2.0, ContainerBlot extends ParentBlot extends ShadowBlot.
// Skip ParentBlot.optimize — it calls enforceAllowedChildren() and
// auto-removes empty blots. Go two levels up to ShadowBlot.optimize.
const parentBlotProto = Object.getPrototypeOf(ContainerBlot.prototype);
const shadowBlotProto = Object.getPrototypeOf(parentBlotProto);

export type LayoutValue = {
    cols: number;
    ratios: string[];
    columns: string[];
};

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
        node.dataset.ratios = value.ratios.join('|');
        node.style.display = 'grid';
        node.style.gridTemplateColumns = value.ratios.join(' ');
        node.style.gap = '16px';

        for (let i = 0; i < value.cols; i++) {
            const col = document.createElement('div');
            col.className = 'ql-layout-col';
            col.dataset.colIndex = String(i);
            col.innerHTML = value.columns[i] || '<p><br></p>';
            node.appendChild(col);
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
