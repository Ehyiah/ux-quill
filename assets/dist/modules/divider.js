import Quill from 'quill';
import DividerBlot from "../blots/divider.js";
Quill.register(DividerBlot);
export class Divider {
  constructor(quill) {
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      // @ts-ignore
      toolbar.addHandler('divider', () => {
        const range = quill.getSelection(true);
        if (range) {
          quill.insertEmbed(range.index, 'divider', true, 'user');
          quill.setSelection(range.index + 1, 'api');
        }
      });
    }
  }
}