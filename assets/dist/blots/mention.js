import Quill from 'quill';
let Embed;
try {
  Embed = Quill.import('blots/embed');
} catch (e) {
  Embed = Quill.import('blots/inline');
}
class MentionBlot extends Embed {
  static blotName = 'mention';
  static tagName = 'span';
  static className = 'ql-mention';
  static create(data) {
    const node = super.create(data);
    node.innerText = `${data.trigger}${data.value}`;
    node.setAttribute('data-id', data.id);
    node.setAttribute('data-value', data.value);
    node.setAttribute('data-trigger', data.trigger);
    // Important for embeds to be non-editable units
    node.setAttribute('contenteditable', 'false');
    return node;
  }
  static value(node) {
    return {
      id: node.getAttribute('data-id'),
      value: node.getAttribute('data-value'),
      trigger: node.getAttribute('data-trigger')
    };
  }
}
export default MentionBlot;