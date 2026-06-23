import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class SpoilerBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const summary = document.createElement('summary');
    summary.className = 'ql-spoiler-summary';
    summary.contentEditable = 'true';
    summary.textContent = value.title || 'Spoiler';
    node.appendChild(summary);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ql-spoiler-content';
    contentDiv.contentEditable = 'true';
    contentDiv.innerHTML = value.content || '';
    node.appendChild(contentDiv);
    return node;
  }
  attach() {
    var _this$domNode$querySe;
    super.attach();
    this.domNode.open = true;
    (_this$domNode$querySe = this.domNode.querySelector('.ql-spoiler-summary')) == null || _this$domNode$querySe.addEventListener('click', e => {
      e.preventDefault();
    });
    this.domNode.addEventListener('toggle', e => {
      e.target.open = true;
    });
  }
  static value(node) {
    const details = node;
    const summary = details.querySelector('.ql-spoiler-summary');
    const contentDiv = details.querySelector('.ql-spoiler-content');
    return {
      title: (summary == null ? void 0 : summary.textContent) || '',
      content: (contentDiv == null ? void 0 : contentDiv.innerHTML) || ''
    };
  }
}
SpoilerBlot.blotName = 'spoiler';
SpoilerBlot.tagName = 'details';
SpoilerBlot.className = 'ql-spoiler';
export default SpoilerBlot;