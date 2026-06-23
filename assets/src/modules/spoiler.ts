import Quill from 'quill';
import SpoilerBlot from '../blots/spoiler.ts';

Quill.register(SpoilerBlot);

export class Spoiler {
    private quill: Quill;

    constructor(quill: Quill) {
        this.quill = quill;
        this.injectStyles();

        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.addHandler('spoiler', () => {
                const range = quill.getSelection(true);
                if (range) {
                    quill.insertEmbed(range.index, 'spoiler', { title: 'Spoiler', content: '' }, 'user');
                    quill.insertText(range.index + 1, '\n', 'api');
                    quill.setSelection(range.index + 2, 'api');
                }
            });
        }
    }

    private injectStyles(): void {
        const id = 'quill-spoiler-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-editor .ql-spoiler {
                margin: 12px 0;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: #fafafa;
                display: block;
                cursor: default;
            }
            .ql-editor .ql-spoiler[open] {
                padding: 8px 12px;
            }
            .ql-editor .ql-spoiler-summary {
                font-weight: bold;
                font-size: 1.05em;
                cursor: text;
                padding: 4px 0;
                outline: none;
                user-select: text;
                list-style: none;
            }
            .ql-editor .ql-spoiler-summary::-webkit-details-marker {
                display: none;
            }
            .ql-editor .ql-spoiler-summary:focus {
                outline: 1px dashed #999;
                outline-offset: 2px;
                border-radius: 2px;
            }
            .ql-editor .ql-spoiler-summary::before {
                content: '▶';
                display: inline-block;
                font-size: 10px;
                margin-right: 6px;
                color: #888;
                transition: transform 0.15s;
            }
            .ql-editor .ql-spoiler[open] > .ql-spoiler-summary::before {
                transform: rotate(90deg);
            }
            .ql-editor .ql-spoiler-content {
                padding: 8px 0 4px 20px;
                border-left: 3px solid #ccc;
                margin-top: 6px;
                min-height: 1em;
            }
        `;
        document.head.appendChild(style);
    }
}
