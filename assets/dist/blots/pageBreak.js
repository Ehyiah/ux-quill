import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class PageBreakBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    if (typeof value === 'string') {
      node.setAttribute('data-label', value);
    }
    return node;
  }
  static value(node) {
    return node.getAttribute('data-label');
  }
}
PageBreakBlot.blotName = 'pageBreak';
PageBreakBlot.tagName = 'div';
PageBreakBlot.className = 'ql-page-break';
export default PageBreakBlot;