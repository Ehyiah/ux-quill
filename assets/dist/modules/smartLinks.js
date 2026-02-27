export class SmartLinks {
  constructor(quill, options) {
    this.regex = void 0;
    const regexFormatMatch = options.linkRegex.match(/^\/(.+)\/([gimuy]*)$/);
    const pattern = regexFormatMatch ? regexFormatMatch[1] : options.linkRegex;
    const flags = regexFormatMatch ? regexFormatMatch[2] || 'i' : 'i';
    try {
      this.regex = new RegExp(pattern, flags);
    } catch (error) {
      console.error('Error with RegEx :', error);
      this.regex = new RegExp('');
      return;
    }
    quill.on('text-change', delta => this.handleTextChange(quill, delta));
  }
  handleTextChange(quill, delta) {
    var _delta$ops;
    const selection = quill.getSelection(false);
    if (!selection) return;
    const cursorIndex = selection.index;
    if (cursorIndex === null || cursorIndex === undefined) return;
    const [leaf] = quill.getLeaf(cursorIndex);
    if (!leaf) return;
    if (leaf.parent.domNode.localName === 'a') return;
    const value = leaf.value();
    if (!value || typeof value !== 'string') return;
    const insert = delta == null || (_delta$ops = delta.ops) == null || (_delta$ops = _delta$ops.find(op => op.insert)) == null ? void 0 : _delta$ops.insert;
    const specialKeyPressed = insert === '\n' || insert === '\t';
    const match = this.regex.exec(value);
    if (!match || !match[0]) return;
    const link = match[0];
    const substringIndex = match.index;
    const leafIndex = quill.getIndex(leaf);
    const startIndex = leafIndex + substringIndex;
    const endIndex = startIndex + link.length;
    if (!specialKeyPressed && cursorIndex <= endIndex && cursorIndex > startIndex) return;
    quill.deleteText(startIndex, link.length, 'api');
    quill.insertText(startIndex, link, 'link', link);
  }
}