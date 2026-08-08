import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class PageBreakBlot extends BlockEmbed {
    static blotName = 'pageBreak';
    static tagName = 'div';
    static className = 'ql-page-break';

    static create(value: string | boolean) {
        const node = super.create();
        if (typeof value === 'string') {
            node.setAttribute('data-label', value);
        }
        return node;
    }

    static value(node: HTMLElement) {
        return node.getAttribute('data-label');
    }
}

export default PageBreakBlot;
