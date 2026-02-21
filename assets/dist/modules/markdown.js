export class Markdown {
  constructor(quill) {
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source !== 'user') return;
      const insert = delta?.ops?.find(op => op.insert)?.insert;
      if (insert === ' ' || insert === '\n') {
        this.handleTextChange(quill);
      }
    });
  }
  handleTextChange(quill) {
    const selection = quill.getSelection();
    if (!selection) return;
    const index = selection.index;
    const [line, offset] = quill.getLine(index);
    if (!line) return;
    const lineIndex = quill.getIndex(line);
    const textBefore = line.domNode.innerText.substring(0, offset - 1);

    // Header
    const headerMatch = textBefore.match(/^(#{1,6})$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      quill.deleteText(lineIndex, level + 1, 'user');
      quill.formatLine(lineIndex, 1, 'header', level, 'user');
      return;
    }

    // Lists
    if (textBefore === '*' || textBefore === '-') {
      quill.deleteText(lineIndex, 2, 'user');
      quill.formatLine(lineIndex, 1, 'list', 'bullet', 'user');
      return;
    }
    if (textBefore === '1.') {
      quill.deleteText(lineIndex, 3, 'user');
      quill.formatLine(lineIndex, 1, 'list', 'ordered', 'user');
      return;
    }
    if (textBefore === '>') {
      quill.deleteText(lineIndex, 2, 'user');
      quill.formatLine(lineIndex, 1, 'blockquote', true, 'user');
      return;
    }
  }
}