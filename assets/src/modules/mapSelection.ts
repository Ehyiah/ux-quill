import Quill from 'quill';

export interface MapSelectionOptions {
    borderColor?: string;
    borderWidth?: string;
    deleteTitle?: string;
    editLocationTitle?: string;
    buttonBeforeLabel?: string;
    buttonAfterLabel?: string;
    buttonBeforeTitle?: string;
    buttonAfterTitle?: string;
    alignLabels?: {
        left?: string;
        leftBlock?: string;
        center?: string;
        right?: string;
    };
    sectionLabels?: {
        align?: string;
        map?: string;
        size?: string;
        insert?: string;
    };
}

const ICONS: Record<string, string> = {
    alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    edit: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    paraBefore: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 3H21"></path></svg>',
    paraAfter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 21H21"></path></svg>',
    sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
};

export default class MapSelection {
    private quill: Quill;
    private options: Required<MapSelectionOptions>;
    private selectedMap: HTMLElement | null = null;
    private overlay: HTMLDivElement | null = null;
    private toolbar: HTMLDivElement | null = null;
    private inputBar: HTMLDivElement | null = null;
    private repositionHandler: () => void;

    constructor(quill: Quill, options: MapSelectionOptions = {}) {
        this.quill = quill;
        this.options = {
            borderColor: '#007bff',
            borderWidth: '2px',
            deleteTitle: 'Delete map',
            editLocationTitle: 'Edit location',
            buttonBeforeLabel: ICONS.paraBefore,
            buttonAfterLabel: ICONS.paraAfter,
            buttonBeforeTitle: 'Insert a paragraph before',
            buttonAfterTitle: 'Insert a paragraph after',
            alignLabels: {
                left: 'Left (wrapped)',
                leftBlock: 'Left (no wrap)',
                center: 'Center',
                right: 'Right (wrapped)',
            },
            sectionLabels: {
                align: 'Align',
                map: 'Map',
                size: 'Size',
                insert: 'Insert',
            },
            ...options,
        };

        this.repositionHandler = this.reposition.bind(this);

        this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
        this.quill.root.addEventListener('scroll', this.repositionHandler, true);
        document.addEventListener('mousedown', this.handleDocumentMouseDown);
        window.addEventListener('resize', this.repositionHandler);

        this.injectStyles();
    }

    private injectStyles(): void {
        const styleId = 'ql-map-selection-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
.ql-editor .ql-map {
    cursor: pointer;
}
.ql-map-overlay {
    position: absolute;
    border: ${this.options.borderWidth} solid ${this.options.borderColor};
    box-sizing: border-box;
    pointer-events: none;
    z-index: 1000;
    user-select: none;
    -webkit-user-select: none;
}
.ql-map-toolbar {
    position: absolute;
    background: #333;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    gap: 4px;
    z-index: 1002;
    pointer-events: auto;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    align-items: flex-end;
}
.ql-map-toolbar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.ql-map-toolbar-section-label {
    font-size: 12px;
    color: #aaa;
    text-transform: uppercase;
    font-weight: bold;
    pointer-events: none;
    user-select: none;
}
.ql-map-toolbar-section-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
}
.ql-map-toolbar button {
    background: transparent;
    border: none;
    color: #ddd;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    transition: background 0.2s, color 0.2s;
    min-width: 28px;
    font-weight: bold;
    font-size: 11px;
}
.ql-map-toolbar button:hover {
    background: #444;
    color: white;
}
.ql-map-toolbar button.active {
    background: ${this.options.borderColor} !important;
    color: white !important;
}
.ql-map-toolbar .ql-toolbar-separator {
    width: 1px;
    background: #444;
    margin: 4px 2px;
    height: 16px;
}
.ql-map-input-bar {
    position: absolute;
    background: #333;
    border-radius: 4px;
    padding: 6px;
    display: flex;
    gap: 4px;
    align-items: center;
    z-index: 1003;
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.ql-map-input-bar input {
    border: 1px solid #555;
    background: #222;
    color: #fff;
    border-radius: 3px;
    padding: 4px 6px;
    font-size: 12px;
}
.ql-map-input-bar button {
    background: transparent;
    border: none;
    color: #ddd;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
}
.ql-map-input-bar button:hover {
    background: #444;
    color: white;
}
`;
        document.head.appendChild(style);
    }

    private handleDocumentMouseDown = (e: MouseEvent): void => {
        const target = e.target as Node;
        if (!this.quill.container.contains(target)) {
            this.deselectMap();
        }
    };

    private handleClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;

        if (this.toolbar && this.toolbar.contains(target)) return;
        if (this.overlay && this.overlay.contains(target)) return;

        const map = this.findMapAtPoint(e.clientX, e.clientY);
        if (map) {
            e.preventDefault();
            this.selectMap(map);
            return;
        }

        this.deselectMap();
    }

    private findMapAtPoint(x: number, y: number): HTMLElement | null {
        const maps = this.quill.root.querySelectorAll<HTMLElement>('.ql-map');
        for (const map of Array.from(maps)) {
            if (!this.quill.root.contains(map)) continue;
            const rect = map.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return map;
            }
        }
        return null;
    }

    private selectMap(map: HTMLElement): void {
        if (this.selectedMap === map) return;
        this.deselectMap();
        this.selectedMap = map;
        this.selectedMap.classList.add('ql-map-selected');
        this.showOverlay();
    }

    private deselectMap(): void {
        if (this.selectedMap) {
            this.selectedMap.classList.remove('ql-map-selected');
            this.selectedMap = null;
        }
        this.hideOverlay();
    }

    private hideOverlay(): void {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.toolbar) {
            this.toolbar.remove();
            this.toolbar = null;
        }
        if (this.inputBar) {
            this.inputBar.remove();
            this.inputBar = null;
        }
    }

    private showOverlay(): void {
        if (!this.selectedMap) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'ql-map-overlay';
        this.quill.container.appendChild(this.overlay);

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'ql-map-toolbar';
        this.quill.container.appendChild(this.toolbar);

        this.setupToolbar();
        this.updateActiveButtons();
        this.reposition();
    }

    private setupToolbar(): void {
        if (!this.toolbar) return;

        this.addSection(this.options.sectionLabels.insert, (container) => {
            const btnBefore = document.createElement('button');
            btnBefore.type = 'button';
            btnBefore.dataset.action = 'paragraph-before';
            btnBefore.innerHTML = this.options.buttonBeforeLabel;
            btnBefore.title = this.options.buttonBeforeTitle;
            btnBefore.addEventListener('click', (e) => {
                e.stopPropagation();
                this.insertParagraphBefore();
            });
            container.appendChild(btnBefore);
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels.size, (container) => {
            const sizes = ['25%', '50%', '75%', '100%'];
            sizes.forEach((size) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = size;
                btn.title = `Set width to ${size}`;
                btn.dataset.size = size;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.setSize(size);
                });
                container.appendChild(btn);
            });

            const btnCustomSize = document.createElement('button');
            btnCustomSize.type = 'button';
            btnCustomSize.innerHTML = ICONS.sizeCustom;
            btnCustomSize.title = 'Set custom width';
            btnCustomSize.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSizeInput();
            });
            container.appendChild(btnCustomSize);
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels.align, (container) => {
            const aligns = [
                { name: 'left', icon: ICONS.alignLeft },
                { name: 'leftBlock', icon: ICONS.alignLeftBlock },
                { name: 'center', icon: ICONS.alignCenter },
                { name: 'right', icon: ICONS.alignRight },
            ];
            aligns.forEach((align) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerHTML = align.icon;
                btn.title = this.options.alignLabels[align.name];
                btn.dataset.align = align.name;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.alignMap(align.name);
                });
                container.appendChild(btn);
            });
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels.map, (container) => {
            const btnEdit = document.createElement('button');
            btnEdit.type = 'button';
            btnEdit.dataset.action = 'edit-location';
            btnEdit.innerHTML = ICONS.edit;
            btnEdit.title = this.options.editLocationTitle;
            btnEdit.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editLocation();
            });
            container.appendChild(btnEdit);

            const btnDelete = document.createElement('button');
            btnDelete.type = 'button';
            btnDelete.dataset.action = 'delete';
            btnDelete.innerHTML = ICONS.trash;
            btnDelete.title = this.options.deleteTitle;
            btnDelete.style.color = '#ff4d4d';
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteMap();
            });
            container.appendChild(btnDelete);
        });

        this.addSeparator();

        this.addSection(this.options.sectionLabels.insert, (container) => {
            const btnAfter = document.createElement('button');
            btnAfter.type = 'button';
            btnAfter.dataset.action = 'paragraph-after';
            btnAfter.innerHTML = this.options.buttonAfterLabel;
            btnAfter.title = this.options.buttonAfterTitle;
            btnAfter.addEventListener('click', (e) => {
                e.stopPropagation();
                this.insertParagraphAfter();
            });
            container.appendChild(btnAfter);
        });
    }

    private addSection(label: string, callback: (container: HTMLElement) => void): void {
        if (!this.toolbar) return;
        const section = document.createElement('div');
        section.className = 'ql-map-toolbar-section';
        if (label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'ql-map-toolbar-section-label';
            labelEl.textContent = label;
            section.appendChild(labelEl);
        }
        const buttons = document.createElement('div');
        buttons.className = 'ql-map-toolbar-section-buttons';
        callback(buttons);
        section.appendChild(buttons);
        this.toolbar.appendChild(section);
    }

    private addSeparator(): void {
        if (!this.toolbar) return;
        const sep = document.createElement('div');
        sep.className = 'ql-toolbar-separator';
        this.toolbar.appendChild(sep);
    }

    private getBlot(): any {
        if (!this.selectedMap) return null;
        return Quill.find(this.selectedMap);
    }

    private alignMap(align: string): void {
        const blot = this.getBlot();
        if (!blot) return;
        blot.format('align', align);
        this.quill.update('api');
        this.updateActiveButtons();
        setTimeout(() => this.reposition(), 100);
    }

    private setSize(size: string): void {
        if (!this.selectedMap || !size) return;

        let finalSize = size.trim();
        if (/^\d+$/.test(finalSize)) {
            finalSize += 'px';
        }

        const blot = this.getBlot();
        if (!blot) return;
        blot.format('width', finalSize);
        this.quill.update('api');
        this.updateActiveSizeButtons();
        setTimeout(() => this.reposition(), 100);
    }

    private showSizeInput(): void {
        if (!this.selectedMap) return;
        const currentWidth = this.selectedMap.style.width || '100%';
        this.showGenericInput(
            currentWidth.endsWith('px') ? currentWidth.replace('px', '') : currentWidth,
            'e.g. 300 or 50%',
            '80px',
            (val) => this.setSize(val),
        );
    }

    private showGenericInput(
        currentValue: string,
        placeholder: string,
        width: string,
        onSave: (val: string) => void,
    ): void {
        if (!this.selectedMap) return;
        if (this.toolbar) this.toolbar.style.display = 'none';

        this.inputBar = document.createElement('div');
        this.inputBar.className = 'ql-map-input-bar';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.placeholder = placeholder;
        input.style.width = width;

        this.inputBar.appendChild(input);

        const btnOk = document.createElement('button');
        btnOk.type = 'button';
        btnOk.innerHTML = ICONS.check;
        btnOk.addEventListener('click', (e) => {
            e.stopPropagation();
            onSave(input.value);
            this.hideInputBar();
        });
        this.inputBar.appendChild(btnOk);

        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerHTML = ICONS.cancel;
        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideInputBar();
        });
        this.inputBar.appendChild(btnCancel);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                onSave(input.value);
                this.hideInputBar();
            } else if (e.key === 'Escape') {
                this.hideInputBar();
            }
        });

        this.quill.container.appendChild(this.inputBar);
        this.reposition();
        input.focus();
        input.select();
    }

    private hideInputBar(): void {
        if (this.inputBar) {
            this.inputBar.remove();
            this.inputBar = null;
        }
        if (this.toolbar) {
            this.toolbar.style.display = 'flex';
            this.reposition();
        }
    }

    private editLocation(): void {
        if (!this.selectedMap) return;
        const mapModule = this.quill.getModule('map') as any;
        if (mapModule && typeof mapModule.editMapLocation === 'function') {
            mapModule.editMapLocation(this.selectedMap);
        }
    }

    private deleteMap(): void {
        if (!this.selectedMap) return;
        const blot = this.getBlot();
        if (blot) {
            const index = this.quill.getIndex(blot);
            this.deselectMap();
            this.quill.deleteText(index, 1, 'user');
        }
    }

    private insertParagraphBefore(): void {
        if (!this.selectedMap) return;
        const blot = this.getBlot();
        if (blot) {
            const index = this.quill.getIndex(blot);
            this.quill.insertText(index, '\n', 'user');
            this.quill.setSelection(index, 0, 'user');
            this.deselectMap();
        }
    }

    private insertParagraphAfter(): void {
        if (!this.selectedMap) return;
        const blot = this.getBlot();
        if (blot) {
            const index = this.quill.getIndex(blot) + 1;
            this.quill.insertText(index, '\n', 'user');
            this.quill.setSelection(index + 1, 0, 'user');
            this.deselectMap();
        }
    }

    private isCurrentAlign(name: string): boolean {
        if (!this.selectedMap) return false;
        const style = this.selectedMap.style;
        switch (name) {
            case 'left':
                return (style.float === '' || style.float === 'none') && style.marginLeft !== 'auto';
            case 'leftBlock':
                return style.float === 'left';
            case 'center':
                return (style.float === '' || style.float === 'none') && style.marginLeft === 'auto';
            case 'right':
                return style.float === 'right';
            default:
                return false;
        }
    }

    private updateActiveButtons(): void {
        if (!this.selectedMap || !this.toolbar) return;
        this.toolbar.querySelectorAll('button[data-align]').forEach((btn) => {
            const name = (btn as HTMLElement).dataset.align;
            if (name && this.isCurrentAlign(name)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.updateActiveSizeButtons();
    }

    private updateActiveSizeButtons(): void {
        if (!this.selectedMap || !this.toolbar) return;
        const currentWidth = this.selectedMap.style.width;
        this.toolbar.querySelectorAll('button[data-size]').forEach((btn) => {
            const size = (btn as HTMLElement).dataset.size;
            if (size && currentWidth === size) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    private reposition(): void {
        if (!this.selectedMap || !this.overlay) return;

        const rect = this.selectedMap.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = rect.top - containerRect.top;
        const left = rect.left - containerRect.left;

        this.overlay.style.top = `${top}px`;
        this.overlay.style.left = `${left}px`;
        this.overlay.style.width = `${rect.width}px`;
        this.overlay.style.height = `${rect.height}px`;

        const activeBar = (this.inputBar && this.inputBar.parentNode) ? this.inputBar : this.toolbar;
        if (!activeBar) return;
        const barWidth = activeBar.offsetWidth || 300;
        let barLeft = left + rect.width / 2 - barWidth / 2;
        if (barLeft < 5) barLeft = 5;
        const maxLeft = containerRect.width - barWidth - 5;
        if (barLeft > maxLeft) barLeft = maxLeft;
        activeBar.style.left = `${barLeft}px`;

        const barHeight = activeBar.offsetHeight || 40;
        let barTop = top - barHeight - 10;
        if (barTop < 0) barTop = 5;
        activeBar.style.top = `${barTop}px`;
    }
}
