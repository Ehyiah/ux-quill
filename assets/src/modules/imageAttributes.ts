import Quill from 'quill';

export class ImageAttributes {
    private quill: Quill;
    private tooltip: HTMLElement | null = null;
    private currentImg: HTMLImageElement | null = null;
    private editButton: HTMLElement | null = null;

    constructor(quill: Quill) {
        this.quill = quill;
        this.injectStyles();

        this.quill.root.addEventListener('click', (ev) => {
            const target = ev.target as HTMLElement;
            if (target && target.tagName === 'IMG') {
                this.showEditButton(target as HTMLImageElement);
            } else if (this.tooltip && !this.tooltip.contains(target) && target !== this.editButton) {
                this.hideAll();
            }
        });

        // Hide UI on scroll
        this.quill.root.addEventListener('scroll', () => this.hideAll());

        // Hide UI if selection moves away from the image
        this.quill.on('selection-change', (range) => {
            if (range) {
                this.hideAll();
            }
        });
    }

    private showEditButton(img: HTMLImageElement): void {
        this.currentImg = img;
        this.hideTooltip();

        if (!this.editButton) {
            this.editButton = document.createElement('div');
            this.editButton.className = 'ql-image-edit-button';
            this.editButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
            this.editButton.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this.showTooltip();
            });
            this.quill.container.appendChild(this.editButton);
        }

        this.positionElement(img, this.editButton, 'button');
        this.editButton.style.display = 'flex';
    }

    private showTooltip(): void {
        if (!this.currentImg) return;

        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'ql-image-attribute-tooltip';
            this.tooltip.innerHTML = `
                <div class="ql-image-attribute-row">
                    <label>Alt text</label>
                    <input type="text" class="ql-image-alt-input" placeholder="Describe the image...">
                </div>
                <div class="ql-image-attribute-row">
                    <label>Title</label>
                    <input type="text" class="ql-image-title-input" placeholder="Image title...">
                </div>
                <div class="ql-image-attribute-actions">
                    <button type="button" class="ql-image-attribute-save">OK</button>
                </div>
            `;

            this.tooltip.querySelector('.ql-image-attribute-save')?.addEventListener('click', () => this.hideAll());

            const altInput = this.tooltip.querySelector('.ql-image-alt-input') as HTMLInputElement;
            const titleInput = this.tooltip.querySelector('.ql-image-title-input') as HTMLInputElement;

            altInput.addEventListener('input', () => {
                if (this.currentImg) {
                    const blot = Quill.find(this.currentImg);
                    if (blot) {
                        const index = this.quill.getIndex(blot);
                        this.quill.formatText(index, 1, 'alt', altInput.value || null, 'api');
                    }
                }
            });

            titleInput.addEventListener('input', () => {
                if (this.currentImg) {
                    const blot = Quill.find(this.currentImg);
                    if (blot) {
                        const index = this.quill.getIndex(blot);
                        this.quill.formatText(index, 1, 'title', titleInput.value || null, 'api');
                    }
                }
            });

            this.quill.container.appendChild(this.tooltip);
        }

        const altInput = this.tooltip.querySelector('.ql-image-alt-input') as HTMLInputElement;
        const titleInput = this.tooltip.querySelector('.ql-image-title-input') as HTMLInputElement;
        altInput.value = this.currentImg.getAttribute('alt') || '';
        titleInput.value = this.currentImg.getAttribute('title') || '';

        this.positionElement(this.currentImg, this.tooltip, 'tooltip');
        this.tooltip.style.display = 'block';
        if (this.editButton) this.editButton.style.display = 'none';

        setTimeout(() => altInput.focus(), 50);
    }

    private positionElement(img: HTMLImageElement, element: HTMLElement, type: 'button' | 'tooltip'): void {
        const imgRect = img.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = imgRect.top - containerRect.top;
        const left = imgRect.left - containerRect.left;

        if (type === 'button') {
            element.style.top = `${top + 5}px`;
            element.style.left = `${left + imgRect.width - 30}px`;
        } else {
            element.style.top = `${top + 35}px`;
            element.style.left = `${Math.max(0, left + imgRect.width / 2 - 110)}px`;
        }
    }

    private hideTooltip(): void {
        if (this.tooltip) this.tooltip.style.display = 'none';
    }

    private hideAll(): void {
        this.hideTooltip();
        if (this.editButton) this.editButton.style.display = 'none';
        this.currentImg = null;
    }

    private injectStyles(): void {
        const id = 'quill-image-attributes-styles';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            .ql-image-edit-button {
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
            .ql-image-edit-button:hover {
                background: #f0f0f0;
                color: #06c;
            }
            .ql-image-attribute-tooltip {
                position: absolute;
                background: #fff;
                border: 1px solid #ccc;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                padding: 12px;
                border-radius: 4px;
                z-index: 1001;
                display: none;
                width: 220px;
                font-family: sans-serif;
            }
            .ql-image-attribute-row {
                margin-bottom: 8px;
            }
            .ql-image-attribute-row label {
                display: block;
                font-size: 11px;
                color: #666;
                margin-bottom: 3px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .ql-image-attribute-row input {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #ddd;
                padding: 5px 8px;
                font-size: 13px;
                border-radius: 3px;
            }
            .ql-image-attribute-row input:focus {
                outline: none;
                border-color: #06c;
            }
            .ql-image-attribute-actions {
                text-align: right;
                margin-top: 10px;
            }
            .ql-image-attribute-save {
                background: #06c;
                color: #fff;
                border: none;
                padding: 4px 12px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            .ql-image-attribute-save:hover {
                background: #0056b3;
            }
        `;
        document.head.appendChild(style);
    }
}
