import Quill from 'quill';
import CalloutBlot from '../blots/callout.ts';

Quill.register(CalloutBlot);

const LABELS: Record<string, string> = {
    info: 'Info',
    warning: 'Warning',
    danger: 'Danger',
    success: 'Success',
};

export class Callout {
    private quill: Quill;
    private options: any;
    private picker: HTMLElement | null = null;

    constructor(quill: Quill, options: any = {}) {
        this.quill = quill;
        this.options = options;
        this.options.types = this.options.types || ['info', 'warning', 'danger', 'success'];
        this.options.defaultType = this.options.defaultType || 'info';
        this.options.labels = this.options.labels || LABELS;

        this.injectStyles();

        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.addHandler('callout', () => this.togglePicker());
        }

        document.addEventListener('click', (e: MouseEvent) => {
            const toolbar = this.quill.getModule('toolbar');
            const inToolbar = toolbar?.container?.contains(e.target as Node);
            if (this.picker && !this.picker.contains(e.target as Node) && !inToolbar) {
                this.hidePicker();
            }
        });
    }

    togglePicker(): void {
        if (this.picker) {
            this.hidePicker();
            return;
        }
        this.showPicker();
    }

    showPicker(): void {
        const toolbar = this.quill.getModule('toolbar');
        if (!toolbar?.container) return;

        const btn = toolbar.container.querySelector('button.ql-callout');
        if (!btn) return;

        this.picker = document.createElement('div');
        this.picker.className = 'ql-callout-picker';

        const types: string[] = this.options.types;
        const labels: Record<string, string> = this.options.labels;

        types.forEach((type: string) => {
            const item = document.createElement('div');
            item.className = `ql-callout-picker-item ql-callout-picker-item--${type}`;
            item.textContent = labels[type] || type;
            item.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                this.insert(type);
                this.hidePicker();
            });
            this.picker!.appendChild(item);
        });

        const rect = btn.getBoundingClientRect();

        this.picker.style.position = 'fixed';
        this.picker.style.top = `${rect.bottom + 4}px`;
        this.picker.style.left = `${rect.left}px`;
        this.picker.style.minWidth = `${rect.width}px`;
        this.picker.style.zIndex = '9999';

        document.body.appendChild(this.picker);
    }

    hidePicker(): void {
        if (this.picker) {
            this.picker.remove();
            this.picker = null;
        }
    }

    insert(type?: string): void {
        const range = this.quill.getSelection(true);
        if (!range) return;

        const t = type || this.options.defaultType;
        this.quill.insertEmbed(range.index, 'callout', { type: t }, 'user');
        this.quill.setSelection(range.index + 1, 'api');
    }

    private injectStyles(): void {
        const id = 'ql-callout-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-callout {
                position: relative;
                box-sizing: border-box;
            }
            .ql-callout--info {
                border-left: 4px solid #1a73e8;
                background-color: #e8f0fe;
            }
            .ql-callout--warning {
                border-left: 4px solid #e37400;
                background-color: #fef7e0;
            }
            .ql-callout--danger {
                border-left: 4px solid #d93025;
                background-color: #fce8e6;
            }
            .ql-callout--success {
                border-left: 4px solid #188038;
                background-color: #e6f4ea;
            }
            .ql-callout-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px 0;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                user-select: none;
                cursor: default;
            }
            .ql-callout--info .ql-callout-header { color: #1a73e8; }
            .ql-callout--warning .ql-callout-header { color: #e37400; }
            .ql-callout--danger .ql-callout-header { color: #d93025; }
            .ql-callout--success .ql-callout-header { color: #188038; }
            .ql-callout-icon {
                font-size: 16px;
                line-height: 1;
            }
            .ql-callout-content {
                padding: 8px 14px 12px;
                min-height: 1em;
            }
            .ql-callout-content p { margin: 0; }
            .ql-callout-content p + p { margin-top: 8px; }
            .ql-callout-picker {
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
            }
            .ql-callout-picker-item {
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                white-space: nowrap;
                transition: background 0.15s;
            }
            .ql-callout-picker-item:hover { background: #f0f0f0; }
            .ql-callout-picker-item--info { border-left: 3px solid #1a73e8; }
            .ql-callout-picker-item--warning { border-left: 3px solid #e37400; }
            .ql-callout-picker-item--danger { border-left: 3px solid #d93025; }
            .ql-callout-picker-item--success { border-left: 3px solid #188038; }
        `;
        document.head.appendChild(style);
    }
}
