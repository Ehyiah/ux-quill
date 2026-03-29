function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
const Delta = Quill.import('delta');
export class PasteSanitizer {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.quill = quill;
    this.options = _extends({
      plain_text: false
    }, options);
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