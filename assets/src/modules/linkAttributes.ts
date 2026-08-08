import Quill from 'quill';

type LinkAttributesOptions = {
    openInNewTabLabel: string;
    noFollowLabel: string;
    saveButtonLabel: string;
};

export class LinkAttributes {
    private quill: Quill;
    private options: LinkAttributesOptions;
    private tooltip: HTMLElement | null = null;
    private currentLink: HTMLAnchorElement | null = null;
    private editButton: HTMLElement | null = null;

    constructor(quill: Quill, options: LinkAttributesOptions) {
        this.quill = quill;
        this.options = {
            openInNewTabLabel: 'Open in new tab',
            noFollowLabel: 'No follow (SEO)',
            saveButtonLabel: 'OK',
            ...options
        };
        this.injectStyles();

        this.quill.root.addEventListener('click', (ev) => {
            const target = ev.target as HTMLElement;
            const anchor = target.closest('a');
            if (anchor && this.quill.root.contains(anchor)) {
                this.showEditButton(anchor as HTMLAnchorElement);
            } else if (this.tooltip && !this.tooltip.contains(target) && target !== this.editButton) {
                this.hideAll();
            }
        });

        this.quill.root.addEventListener('scroll', () => this.hideAll());
        this.quill.on('selection-change', (range) => {
            if (range) this.hideAll();
        });
    }

    private showEditButton(anchor: HTMLAnchorElement): void {
        this.currentLink = anchor;
        this.hideTooltip();

        if (!this.editButton) {
            this.editButton = document.createElement('div');
            this.editButton.className = 'ql-link-edit-button';
            this.editButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
            this.editButton.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.showTooltip();
            });
            this.quill.container.appendChild(this.editButton);
        }

        this.positionElement(anchor, this.editButton, 'button');
        this.editButton.style.display = 'flex';
    }

    private showTooltip(): void {
        if (!this.currentLink) return;

        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'ql-link-attribute-tooltip';
            this.tooltip.innerHTML = `
                <div class="ql-link-attribute-row">
                    <label><input type="checkbox" class="ql-link-target-input"> ${this.options.openInNewTabLabel}</label>
                </div>
                <div class="ql-link-attribute-row">
                    <label><input type="checkbox" class="ql-link-rel-input"> ${this.options.noFollowLabel}</label>
                </div>
                <div class="ql-link-attribute-actions">
                    <button type="button" class="ql-link-attribute-save">${this.options.saveButtonLabel}</button>
                </div>
            `;

            this.tooltip.querySelector('.ql-link-attribute-save')?.addEventListener('click', () => this.hideAll());

            const targetInput = this.tooltip.querySelector('.ql-link-target-input') as HTMLInputElement;
            const relInput = this.tooltip.querySelector('.ql-link-rel-input') as HTMLInputElement;

            targetInput.addEventListener('change', () => {
                if (this.currentLink) {
                    const blot = Quill.find(this.currentLink);
                    if (blot) {
                        // @ts-ignore
                        blot.format('target', targetInput.checked ? '_blank' : null);
                    }
                }
            });

            relInput.addEventListener('change', () => {
                if (this.currentLink) {
                    const blot = Quill.find(this.currentLink);
                    if (blot) {
                        // @ts-ignore
                        blot.format('rel', relInput.checked ? 'nofollow' : null);
                    }
                }
            });

            this.quill.container.appendChild(this.tooltip);
        }

        const targetInput = this.tooltip.querySelector('.ql-link-target-input') as HTMLInputElement;
        const relInput = this.tooltip.querySelector('.ql-link-rel-input') as HTMLInputElement;
        
        targetInput.checked = this.currentLink.getAttribute('target') === '_blank';
        relInput.checked = this.currentLink.getAttribute('rel') === 'nofollow';

        this.positionElement(this.currentLink, this.tooltip, 'tooltip');
        this.tooltip.style.display = 'block';
        if (this.editButton) this.editButton.style.display = 'none';
    }

    private positionElement(anchor: HTMLAnchorElement, element: HTMLElement, type: 'button' | 'tooltip'): void {
        const rect = anchor.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = rect.top - containerRect.top;
        const left = rect.left - containerRect.left;

        if (type === 'button') {
            element.style.top = `${top - 30}px`;
            element.style.left = `${left + rect.width / 2 - 13}px`;
        } else {
            element.style.top = `${top + rect.height + 5}px`;
            element.style.left = `${left}px`;
        }
    }

    private hideTooltip(): void {
        if (this.tooltip) this.tooltip.style.display = 'none';
    }

    private hideAll(): void {
        this.hideTooltip();
        if (this.editButton) this.editButton.style.display = 'none';
        this.currentLink = null;
    }

    private injectStyles(): void {
        const id = 'quill-link-attributes-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-link-edit-button {
                position: absolute;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                width: 26px;
                height: 26px;
                display: none;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                z-index: 1000;
                color: #444;
            }
            .ql-link-edit-button:hover {
                background: #f0f0f0;
                color: #06c;
            }
            .ql-link-attribute-tooltip {
                position: absolute;
                background: #fff;
                border: 1px solid #ccc;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                padding: 10px;
                border-radius: 4px;
                z-index: 1001;
                display: none;
                min-width: 150px;
                font-family: sans-serif;
            }
            .ql-link-attribute-row {
                margin-bottom: 5px;
            }
            .ql-link-attribute-row label {
                display: flex;
                align-items: center;
                font-size: 13px;
                color: #444;
                cursor: pointer;
            }
            .ql-link-attribute-row input {
                margin-right: 8px;
            }
            .ql-link-attribute-actions {
                text-align: right;
                margin-top: 8px;
            }
            .ql-link-attribute-save {
                background: #06c;
                color: #fff;
                border: none;
                padding: 3px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }
}
