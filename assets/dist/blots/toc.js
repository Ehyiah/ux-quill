import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class TocBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
    const list = document.createElement('ol');
    value.forEach(entry => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = "#" + entry.id;
      a.textContent = entry.text;
      a.tabIndex = -1;
      li.appendChild(a);
      list.appendChild(li);
    });
    node.appendChild(list);
    return node;
  }
  static value(node) {
    return Array.from(node.querySelectorAll('a')).map(a => {
      var _a$getAttribute;
      return {
        id: ((_a$getAttribute = a.getAttribute('href')) == null ? void 0 : _a$getAttribute.slice(1)) || '',
        text: a.textContent || ''
      };
    });
  }
}
TocBlot.blotName = 'toc';
TocBlot.tagName = 'div';
TocBlot.className = 'table-of-contents';
export default TocBlot;