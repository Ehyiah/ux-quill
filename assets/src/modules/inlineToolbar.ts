import Quill from 'quill';

export interface InlineToolbarOptions {
    buttons?: string[];
}

const BUTTON_CONFIG: Record<string, { icon: string, title: string }> = {
    bold: {
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',
        title: 'Bold',
    },
    italic: {
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
        title: 'Italic',
    },
    underline: {
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>',
        title: 'Underline',
    },
    strike: {
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 2"></path><path d="M14 12H4"></path><path d="M7 12h10a3 3 0 0 1 0 6H9a3 3 0 0 1-2.83-2"></path><path d="M14 20h7"></path></svg>',
        title: 'Strikethrough',
    },
};

export default class InlineToolbar {
    static NAME = 'inlineToolbar';
    private quill: Quill;
    private options: Required<InlineToolbarOptions>;
    private toolbar: HTMLElement | null = null;
    private lastRange: { index: number, length: number } | null = null;

    constructor(quill: Quill, options: InlineToolbarOptions = {}) {
        this.quill = quill;
        this.options = {
            buttons: ['bold', 'italic', 'underline', 'strike'],
            ...options,
        };

        this.injectStyles();
        this.setupListeners();
    }

    private injectStyles() {
        const styleId = 'ql-inline-toolbar-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .ql-inline-toolbar {
                position: absolute;
                background: white;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 4px;
                display: none;
                gap: 2px;
                z-index: 2000;
                border: 1px solid #eee;
                transition: opacity 0.2s ease;
                pointer-events: auto;
            }
            .ql-inline-toolbar button {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 6px 8px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #37352f;
                transition: background 0.2s;
            }
            .ql-inline-toolbar button:hover {
                background: #f1f1f1;
            }
            .ql-inline-toolbar button.active {
                color: #2383e2;
                background: #ebf5ff;
            }
        `;
        document.head.appendChild(style);
    }

    private setupListeners() {
        this.quill.on('selection-change', (range) => {
            if (range && range.length > 0) {
                this.lastRange = range;
                setTimeout(() => this.showToolbar(range), 10);
            } else {
                this.hideToolbar();
            }
        });

        this.quill.root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideToolbar();
            }
        });

        document.addEventListener('mousedown', (e) => {
            const target = e.target as HTMLElement;
            if (this.toolbar && !this.toolbar.contains(target) && !this.quill.container.contains(target)) {
                this.hideToolbar();
            }
        });

        this.quill.on('text-change', () => {
            if (this.toolbar && this.toolbar.style.display === 'flex') {
                const range = this.quill.getSelection();
                if (range && range.length > 0) {
                    this.lastRange = range;
                    this.showToolbar(range);
                } else {
                    this.hideToolbar();
                }
            }
        });
    }

    private showToolbar(range: { index: number, length: number }) {
        if (!this.toolbar) {
            this.createToolbar();
        }

        const bounds = this.quill.getBounds(range.index, range.length);
        if (!bounds) return;

        const containerRect = this.quill.container.getBoundingClientRect();

        this.toolbar!.style.display = 'flex';

        const toolbarHeight = this.toolbar!.offsetHeight;
        const toolbarWidth = this.toolbar!.offsetWidth;

        let top = bounds.top - toolbarHeight - 10;
        let left = bounds.left + (bounds.width / 2) - (toolbarWidth / 2);

        if (top < 0) top = bounds.bottom + 10;
        if (left < 0) left = 5;
        if (left + toolbarWidth > containerRect.width) left = containerRect.width - toolbarWidth - 5;

        this.toolbar!.style.top = `${top}px`;
        this.toolbar!.style.left = `${left}px`;

        this.updateButtonStates();
    }

    private hideToolbar() {
        if (this.toolbar) {
            this.toolbar.style.display = 'none';
        }
    }

    private createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'ql-inline-toolbar';

        const formats = this.options.buttons
            .filter((name) => BUTTON_CONFIG[name])
            .map((name) => ({
                name,
                icon: BUTTON_CONFIG[name].icon,
                title: BUTTON_CONFIG[name].title,
            }));

        formats.forEach((f) => {
            const btn = document.createElement('button');
            btn.innerHTML = f.icon;
            btn.title = f.title;
            btn.type = 'button';
            btn.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const range = this.lastRange || this.quill.getSelection();
                if (!range) return;

                const current = this.quill.getFormat(range);
                this.quill.format(f.name, !current[f.name]);
                this.updateButtonStates();
            };
            btn.dataset.format = f.name;
            this.toolbar!.appendChild(btn);
        });

        this.quill.container.appendChild(this.toolbar);
    }

    private updateButtonStates() {
        if (!this.toolbar) return;
        const range = this.lastRange || this.quill.getSelection();
        const current = range ? this.quill.getFormat(range) : {};
        this.toolbar.querySelectorAll('button').forEach((btn) => {
            const format = btn.dataset.format;
            if (format && current[format]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
