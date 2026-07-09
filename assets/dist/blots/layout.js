import Quill from 'quill';
const ContainerBlot = Quill.import('blots/container');
const BlockBlot = Quill.import('blots/block');
const BlockEmbed = Quill.import('blots/block/embed');

// In Quill 2.0, ContainerBlot extends ParentBlot extends ShadowBlot.
// Skip ParentBlot.optimize — it calls enforceAllowedChildren() and
// auto-removes empty blots. Go two levels up to ShadowBlot.optimize.
const parentBlotProto = Object.getPrototypeOf(ContainerBlot.prototype);
const shadowBlotProto = Object.getPrototypeOf(parentBlotProto);
class LayoutColumnBlot extends ContainerBlot {
  optimize(context) {
    shadowBlotProto.optimize.call(this, context);
  }
}
LayoutColumnBlot.blotName = 'layout-column';
LayoutColumnBlot.tagName = 'div';
LayoutColumnBlot.className = 'ql-layout-col';
LayoutColumnBlot.allowedChildren = [BlockBlot, BlockEmbed, ContainerBlot];
class LayoutBlot extends ContainerBlot {
  static create(value) {
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
  optimize(context) {
    shadowBlotProto.optimize.call(this, context);
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
LayoutBlot.allowedChildren = [LayoutColumnBlot];
export { LayoutColumnBlot };
export default LayoutBlot;