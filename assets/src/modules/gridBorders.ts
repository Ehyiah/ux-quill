import Quill from 'quill';

export interface GridBordersOptions {
    active?: boolean;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: string;
    toggleButton?: boolean;
}

const GRID_ICON = '<svg viewBox="0 0 18 18" width="14" height="14"><rect x="3" y="3" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.5"/></svg>';

const STYLE_ID = 'ql-grid-borders-global';

function injectGlobalStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .ql-editor.ql-grid-borders-active > * {
            outline: var(--ql-grid-width, 1px) var(--ql-grid-style, dashed) var(--ql-grid-color, #d0d0d0);
            outline-offset: calc(-1px * var(--ql-grid-width, 1px));
        }
        .ql-toolbar button.ql-grid-borders {
            color: #444 !important;
        }
        .ql-toolbar button.ql-grid-borders:hover,
        .ql-toolbar button.ql-grid-borders.ql-grid-borders-btn-active {
            color: #06c !important;
        }
    `;
    document.head.appendChild(style);
}

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (obj[key] !== null && obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}

const DEFAULTS: Required<GridBordersOptions> = {
    active: false,
    borderColor: '#d0d0d0',
    borderWidth: 1,
    borderStyle: 'dashed',
    toggleButton: true,
};

export default class GridBorders {
    private quill: Quill;
    private options: Required<GridBordersOptions>;
    private enabled: boolean;
    private btn: HTMLButtonElement | null = null;
    private formatsSpan: HTMLSpanElement | null = null;

    constructor(quill: Quill, options: GridBordersOptions = {}) {
        this.quill = quill;
        this.options = { ...DEFAULTS, ...pick(options, Object.keys(DEFAULTS) as (keyof GridBordersOptions)[]) };
        this.enabled = this.options.active;

        injectGlobalStyles();

        if (this.options.toggleButton) {
            this.addToolbarButton();
        }

        if (this.enabled) {
            this.show();
        }
    }

    private applyCSSProperties() {
        const root = this.quill.root;
        root.style.setProperty('--ql-grid-color', this.options.borderColor);
        root.style.setProperty('--ql-grid-width', `${this.options.borderWidth}px`);
        root.style.setProperty('--ql-grid-style', this.options.borderStyle);
    }

    private addToolbarButton() {
        const toolbar = this.quill.getModule('toolbar');
        if (!toolbar) return;

        const container = toolbar.container;
        if (!container) return;

        this.formatsSpan = document.createElement('span');
        this.formatsSpan.className = 'ql-formats';

        this.btn = document.createElement('button');
        this.btn.innerHTML = GRID_ICON;
        this.btn.title = 'Afficher la grille';
        this.btn.type = 'button';
        this.btn.className = 'ql-grid-borders';
        this.btn.onclick = (e) => {
            e.stopPropagation();
            this.toggle();
        };

        this.formatsSpan.appendChild(this.btn);
        container.appendChild(this.formatsSpan);
    }

    toggle() {
        if (this.enabled) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.enabled = true;
        this.applyCSSProperties();
        this.quill.root.classList.add('ql-grid-borders-active');
        if (this.btn) {
            this.btn.classList.add('ql-grid-borders-btn-active');
            this.btn.title = 'Masquer la grille';
        }
    }

    hide() {
        this.enabled = false;
        this.quill.root.classList.remove('ql-grid-borders-active');
        if (this.btn) {
            this.btn.classList.remove('ql-grid-borders-btn-active');
            this.btn.title = 'Afficher la grille';
        }
    }

    isVisible(): boolean {
        return this.enabled;
    }
}
