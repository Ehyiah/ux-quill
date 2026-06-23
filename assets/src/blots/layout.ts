import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

export type LayoutValue = {
    cols: number;
    ratios: string[];
    columns: string[];
};

class LayoutBlot extends BlockEmbed {
    static blotName = 'layout';
    static tagName = 'div';
    static className = 'ql-layout';

    static create(value: LayoutValue): HTMLElement {
        const node = super.create();
        node.classList.add('ql-layout');

        node.dataset.cols = String(value.cols);
        node.dataset.ratios = value.ratios.join('|');
        node.style.display = 'grid';
        node.style.gridTemplateColumns = value.ratios.join(' ');
        node.style.gap = '16px';
        node.contentEditable = 'false';

        for (let i = 0; i < value.cols; i++) {
            const col = document.createElement('div');
            col.className = 'ql-layout-col';
            col.contentEditable = 'true';
            col.dataset.colIndex = String(i);
            col.innerHTML = value.columns[i] || '<p><br></p>';
            node.appendChild(col);
        }

        return node;
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

export default LayoutBlot;
