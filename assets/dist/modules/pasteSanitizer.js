import Quill from 'quill';
const Delta = Quill.import('delta');
export class PasteSanitizer {
  quill;
  options;
  constructor(quill, options) {
    this.quill = quill;
    this.options = {
      plain_text: false,
      ...options
    };
    this.init();
  }
  init() {
    this.quill.root.addEventListener('paste', this.handlePaste.bind(this));
  }
  handlePaste(event) {
    if (!this.options.plain_text) {
      return;
    }
    event.preventDefault(); // Prevent Quill's default paste handling

    const clipboardData = event.clipboardData || window.clipboardData;
    const text = clipboardData.getData('text/plain');
    if (text) {
      const selection = this.quill.getSelection();
      if (selection) {
        // Insert plain text at the current cursor position
        this.quill.clipboard.dangerouslyPasteHTML(selection.index, text);
      } else {
        // If no selection, insert at the end
        this.quill.clipboard.dangerouslyPasteHTML(this.quill.getLength(), text);
      }
    }
  }
}