import Quill from 'quill';
import PageBreakBlot from "../blots/pageBreak.js";
Quill.register(PageBreakBlot);
export class PageBreak {
  constructor(quill, options) {
    this.label = void 0;
    this.label = options.label || 'Page Break';
    this.injectStyles();
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      // @ts-ignore
      toolbar.addHandler('pageBreak', () => {
        const range = quill.getSelection(true);
        if (range) {
          quill.insertEmbed(range.index, 'pageBreak', this.label, 'user');
          quill.insertText(range.index + 1, '\n', 'api');
          quill.setSelection(range.index + 2, 'api');
        }
      });
    }
  }
  injectStyles() {
    const id = 'quill-page-break-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-editor .ql-page-break {\n                border-top: 1px dashed #ccc;\n                height: 1px;\n                margin: 24px 0;\n                position: relative;\n                text-align: center;\n                cursor: default;\n                display: block;\n            }\n            .ql-editor .ql-page-break::after {\n                background-color: #fff;\n                color: #777;\n                content: attr(data-label);\n                font-size: 11px;\n                font-weight: bold;\n                padding: 0 10px;\n                position: absolute;\n                top: -8px;\n                left: 50%;\n                transform: translateX(-50%);\n                text-transform: uppercase;\n                letter-spacing: 1px;\n            }\n            /* Fallback if data-label is missing */\n            .ql-editor .ql-page-break:not([data-label])::after {\n                content: 'Page Break';\n            }\n            @media print {\n                .ql-page-break {\n                    page-break-after: always;\n                    border: none;\n                    visibility: hidden;\n                    display: block;\n                    height: 0;\n                    margin: 0;\n                }\n            }\n        ";
    document.head.appendChild(style);
  }
}