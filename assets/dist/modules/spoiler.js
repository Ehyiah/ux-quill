import Quill from 'quill';
import SpoilerBlot from "../blots/spoiler.js";
Quill.register(SpoilerBlot);
export class Spoiler {
  constructor(quill) {
    this.quill = void 0;
    this.quill = quill;
    this.injectStyles();
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('spoiler', () => {
        const range = quill.getSelection(true);
        if (range) {
          quill.insertEmbed(range.index, 'spoiler', {
            title: 'Spoiler',
            content: ''
          }, 'user');
          quill.insertText(range.index + 1, '\n', 'api');
          quill.setSelection(range.index + 2, 'api');
        }
      });
    }
  }
  injectStyles() {
    const id = 'quill-spoiler-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-editor .ql-spoiler {\n                margin: 12px 0;\n                border: 1px solid #ddd;\n                border-radius: 6px;\n                background: #fafafa;\n                display: block;\n                cursor: default;\n            }\n            .ql-editor .ql-spoiler[open] {\n                padding: 8px 12px;\n            }\n            .ql-editor .ql-spoiler-summary {\n                font-weight: bold;\n                font-size: 1.05em;\n                cursor: text;\n                padding: 4px 0;\n                outline: none;\n                user-select: text;\n                list-style: none;\n            }\n            .ql-editor .ql-spoiler-summary::-webkit-details-marker {\n                display: none;\n            }\n            .ql-editor .ql-spoiler-summary:focus {\n                outline: 1px dashed #999;\n                outline-offset: 2px;\n                border-radius: 2px;\n            }\n            .ql-editor .ql-spoiler-summary::before {\n                content: '\u25B6';\n                display: inline-block;\n                font-size: 10px;\n                margin-right: 6px;\n                color: #888;\n                transition: transform 0.15s;\n            }\n            .ql-editor .ql-spoiler[open] > .ql-spoiler-summary::before {\n                transform: rotate(90deg);\n            }\n            .ql-editor .ql-spoiler-content {\n                padding: 8px 0 4px 20px;\n                border-left: 3px solid #ccc;\n                margin-top: 6px;\n                min-height: 1em;\n            }\n        ";
    document.head.appendChild(style);
  }
}