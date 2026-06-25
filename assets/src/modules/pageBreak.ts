import Quill from 'quill';
import PageBreakBlot from '../blots/pageBreak.ts';

Quill.register(PageBreakBlot);

type PageBreakOptions = {
    label: string;
};

export class PageBreak {
    private label: string;

    constructor(quill: Quill, options: PageBreakOptions) {
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

    private injectStyles(): void {
        const id = 'quill-page-break-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-editor .ql-page-break {
                border-top: 1px dashed #ccc;
                height: 1px;
                margin: 24px 0;
                position: relative;
                text-align: center;
                cursor: default;
                display: block;
            }
            .ql-editor .ql-page-break::after {
                background-color: #fff;
                color: #777;
                content: attr(data-label);
                font-size: 11px;
                font-weight: bold;
                padding: 0 10px;
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            /* Fallback if data-label is missing */
            .ql-editor .ql-page-break:not([data-label])::after {
                content: 'Page Break';
            }
            @media print {
                .ql-page-break {
                    page-break-after: always;
                    border: none;
                    visibility: hidden;
                    display: block;
                    height: 0;
                    margin: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
