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
export function createColumnNode(index, html) {
  if (html === void 0) {
    html = EMPTY_COLUMN_HTML;
  }
  const col = document.createElement('div');
  col.className = 'ql-layout-col';
  col.dataset.colIndex = String(index);
  col.innerHTML = html && html.trim() !== '' ? html : EMPTY_COLUMN_HTML;
  return col;
}
export function applyRatios(node, ratios) {
  node.dataset.ratios = ratios.join('|');
  node.style.gridTemplateColumns = ratios.join(' ');
}
export function isColumnEmpty(col) {
  if (!col) return true;
  if ((col.textContent || '').trim() !== '') return false;
  return col.querySelector(EMBED_SELECTOR) === null;
}
export function isHtmlEmpty(html) {
  if (!html || html.trim() === '') return true;
  const holder = document.createElement('div');
  holder.innerHTML = html;
  return isColumnEmpty(holder);
}
export function normalizeRatios(count) {
  return Array.from({
    length: count
  }, () => '1fr');
}
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
    node.style.display = 'grid';
    node.style.gap = '16px';
    applyRatios(node, value.ratios);
    for (let i = 0; i < value.cols; i++) {
      node.appendChild(createColumnNode(i, value.columns[i]));
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