import Quill from 'quill';

const ICONS = {
    text: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
    h1: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17 12l3-2v8"></path></svg>',
    h2: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"></path></svg>',
    h3: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17.5 10.5c.2-.5.8-.8 1.4-.8 1.2 0 2 1 2 2s-.8 2-2 2c-.7 0-1.2-.3-1.4-.8"></path><path d="M17.5 15.5c.2.5.8.8 1.4.8 1.2 0 2-1 2-2s-.8-2-2-2c-.7 0-1.2.3-1.4.8"></path></svg>',
    bullet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    ordered: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>',
    quote: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>',
    code: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
};

export default class SlashModule {
    static NAME = 'slashModule';
    private quill: Quill;
    private options: Record<string, never>;
    private slashMenu: HTMLElement | null = null;
    private lastRange: { index: number, length: number } | null = null;

    constructor(quill: Quill, options: Record<string, never> = {}) {
        this.quill = quill;
        this.options = options;

        this.injectStyles();
        this.setupListeners();
    }

    private injectStyles() {
        const styleId = 'ql-slash-module-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .ql-slash-menu {
                position: absolute;
                background: white;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 6px;
                display: none;
                z-index: 2001;
                border: 1px solid #eee;
                width: 260px;
                max-height: 300px;
                overflow-y: auto;
                pointer-events: auto;
            }
            .ql-slash-menu .item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 10px;
                cursor: pointer;
                border-radius: 4px;
                color: #37352f;
                font-size: 14px;
                transition: background 0.2s;
            }
            .ql-slash-menu .item:hover {
                background: #f1f1f1;
            }
            .ql-slash-menu .item-icon {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fff;
                border-radius: 4px;
                border: 1px solid #eee;
                color: #666;
            }
            .ql-slash-menu .item-content {
                display: flex;
                flex-direction: column;
            }
            .ql-slash-menu .item-label {
                font-weight: 500;
                line-height: 1.2;
            }
            .ql-slash-menu .item-description {
                font-size: 11px;
                color: #777;
                margin-top: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    private setupListeners() {
        this.quill.root.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                setTimeout(() => this.checkSlashCommand(), 1);
            } else if (e.key === 'Escape') {
                this.hideSlashMenu();
            }
        });

        document.addEventListener('mousedown', (e) => {
            const target = e.target as HTMLElement;
            if (this.slashMenu && !this.slashMenu.contains(target)) {
                this.hideSlashMenu();
            }
        });
    }

    private checkSlashCommand() {
        const range = this.quill.getSelection();
        if (!range) return;
        this.lastRange = range;

        const [line, offset] = this.quill.getLine(range.index);
        const text = line.domNode.textContent || '';
        const beforeCursor = text.substring(0, offset);

        if (beforeCursor.endsWith('/')) {
            this.showSlashMenu(range);
        }
    }

    private showSlashMenu(range: { index: number }) {
        if (!this.slashMenu) {
            this.createSlashMenu();
        }

        const bounds = this.quill.getBounds(range.index);
        if (!bounds) return;

        const containerRect = this.quill.container.getBoundingClientRect();
        this.slashMenu!.style.display = 'block';

        let top = bounds.bottom + 5;
        let left = bounds.left;

        if (top + this.slashMenu!.offsetHeight > containerRect.height) {
            top = bounds.top - this.slashMenu!.offsetHeight - 5;
        }
        if (left + this.slashMenu!.offsetWidth > containerRect.width) {
            left = containerRect.width - this.slashMenu!.offsetWidth - 5;
        }

        this.slashMenu!.style.top = `${top}px`;
        this.slashMenu!.style.left = `${left}px`;
    }

    private hideSlashMenu() {
        if (this.slashMenu) {
            this.slashMenu.style.display = 'none';
        }
        this.lastRange = null;
    }

    private createSlashMenu() {
        this.slashMenu = document.createElement('div');
        this.slashMenu.className = 'ql-slash-menu';

        const items = [
            { label: 'Text', description: 'Just start writing', icon: ICONS.text, action: (index: number) => this.setBlock(index, null) },
            { label: 'Heading 1', description: 'Big section heading', icon: ICONS.h1, action: (index: number) => this.setBlock(index, 'header', 1) },
            { label: 'Heading 2', description: 'Medium section heading', icon: ICONS.h2, action: (index: number) => this.setBlock(index, 'header', 2) },
            { label: 'Heading 3', description: 'Small section heading', icon: ICONS.h3, action: (index: number) => this.setBlock(index, 'header', 3) },
            { label: 'Bullet List', description: 'Simple bulleted list', icon: ICONS.bullet, action: (index: number) => this.setBlock(index, 'list', 'bullet') },
            { label: 'Numbered List', description: 'Numbered list', icon: ICONS.ordered, action: (index: number) => this.setBlock(index, 'list', 'ordered') },
            { label: 'Quote', description: 'Capture a quote', icon: ICONS.quote, action: (index: number) => this.setBlock(index, 'blockquote', true) },
            { label: 'Code', description: 'Code snippet', icon: ICONS.code, action: (index: number) => this.setBlock(index, 'code-block', true) },
        ];

        items.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'item';
            el.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-content">
                    <div class="item-label">${item.label}</div>
                    <div class="item-description">${item.description}</div>
                </div>
            `;
            el.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const range = this.lastRange || this.quill.getSelection();
                if (range) {
                    const index = range.index;
                    const [line, offset] = this.quill.getLine(index);
                    this.quill.deleteText(index - 1, 1, 'user');

                    if (offset > 1) {
                        this.quill.insertText(index - 1, '\n', 'user');
                        item.action(index);
                    } else {
                        item.action(index - 1);
                    }
                }
                this.hideSlashMenu();
            };
            this.slashMenu!.appendChild(el);
        });

        this.quill.container.appendChild(this.slashMenu);
    }

    private setBlock(index: number, format: string | null, value: any = true) {
        this.quill.focus();
        if (format) {
            this.quill.formatLine(index, 1, format, value, 'user');
        } else {
            this.quill.formatLine(index, 1, {
                header: false,
                blockquote: false,
                list: false,
                'code-block': false,
            }, 'user');
        }
        this.quill.setSelection(index, 0, 'user');
    }
}
