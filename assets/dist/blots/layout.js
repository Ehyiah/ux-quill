import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class LayoutBlot extends BlockEmbed {
  static create(value) {
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
  static value(node) {
    const cols = node.querySelectorAll('.ql-layout-col');
    return {
      cols: parseInt(node.dataset.cols || '2', 10),
      ratios: (node.dataset.ratios || '1fr|1fr').split('|'),
      columns: Array.from(cols).map(c => c.innerHTML)
    };
  }
}
LayoutBlot.blotName = 'layout';
LayoutBlot.tagName = 'div';
LayoutBlot.className = 'ql-layout';
export default LayoutBlot;