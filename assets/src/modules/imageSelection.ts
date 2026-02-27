import Quill from 'quill';

export interface ImageSelectionOptions {
    borderColor?: string;
    borderWidth?: string;
    buttonBeforeLabel?: string;
    buttonAfterLabel?: string;
    buttonBeforeTitle?: string;
    buttonAfterTitle?: string;
}

export default class ImageSelection {
    private quill: Quill;
    private options: ImageSelectionOptions;
    private selectedImage: HTMLImageElement | null = null;
    private buttonBefore: HTMLButtonElement | null = null;
    private buttonAfter: HTMLButtonElement | null = null;
    private repositionHandler: () => void;

    constructor(quill: Quill, options: ImageSelectionOptions = {}) {
        this.quill = quill;
        this.options = {
            borderColor: '#007bff',
            borderWidth: '0px',
            buttonBeforeLabel: '¶+',
            buttonAfterLabel: '+¶',
            buttonBeforeTitle: 'Insert a paragraph before',
            buttonAfterTitle: 'Insert a paragraph after',
            ...options
        };
        this.repositionHandler = this.repositionButtons.bind(this);

        this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
        this.quill.on('text-change', () => this.deselectImage());

        this.injectStyles();
    }

    private injectStyles() {
        const styleId = 'ql-image-selection-styles';
        let style = document.getElementById(styleId) as HTMLStyleElement;
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.innerHTML = `
            .ql-editor img.ql-image-selected {
                border: ${this.options.borderWidth} solid ${this.options.borderColor} !important;
                box-sizing: border-box !important;
                border-radius: 4px;
            }
            .ql-image-selection-button {
                position: absolute;
                background: ${this.options.borderColor};
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                cursor: pointer;
                z-index: 2000;
                font-size: 14px;
                font-weight: bold;
                line-height: 1.2;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                transition: opacity 0.2s ease, background 0.2s ease;
            }
            .ql-image-selection-button:hover {
                filter: brightness(0.9);
            }
        `;
    }

    private handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target instanceof HTMLImageElement && this.quill.root.contains(target)) {
            this.selectImage(target);
        } else if ((this.buttonBefore && this.buttonBefore.contains(target)) || (this.buttonAfter && this.buttonAfter.contains(target))) {
            // Clicked on a button, let its own listener handle it
        } else {
            this.deselectImage();
        }
    }

    private selectImage(img: HTMLImageElement) {
        if (this.selectedImage === img) return;
        this.deselectImage();

        this.selectedImage = img;
        this.selectedImage.classList.add('ql-image-selected');

        this.showButtons(img);
    }

    private deselectImage() {
        if (this.selectedImage) {
            this.selectedImage.classList.remove('ql-image-selected');
            this.selectedImage = null;
        }
        if (this.buttonBefore) {
            this.buttonBefore.remove();
            this.buttonBefore = null;
        }
        if (this.buttonAfter) {
            this.buttonAfter.remove();
            this.buttonAfter = null;
        }
        window.removeEventListener('scroll', this.repositionHandler, true);
        window.removeEventListener('resize', this.repositionHandler, true);
        this.quill.root.removeEventListener('scroll', this.repositionHandler, true);
    }

    private showButtons(img: HTMLImageElement) {
        this.buttonBefore = document.createElement('button');
        this.buttonBefore.innerHTML = this.options.buttonBeforeLabel || '¶+';
        this.buttonBefore.className = 'ql-image-selection-button';
        this.buttonBefore.title = this.options.buttonBeforeTitle || 'Insert a paragraph before';
        this.buttonBefore.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.insertParagraphBefore();
        });

        this.buttonAfter = document.createElement('button');
        this.buttonAfter.innerHTML = this.options.buttonAfterLabel || '+¶';
        this.buttonAfter.className = 'ql-image-selection-button';
        this.buttonAfter.title = this.options.buttonAfterTitle || 'Insert a paragraph after';
        this.buttonAfter.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.insertParagraphAfter();
        });

        this.quill.container.appendChild(this.buttonBefore);
        this.quill.container.appendChild(this.buttonAfter);

        this.repositionButtons();

        window.addEventListener('scroll', this.repositionHandler, true);
        window.addEventListener('resize', this.repositionHandler, true);
        this.quill.root.addEventListener('scroll', this.repositionHandler, true);
    }

    private repositionButtons() {
        if (!this.selectedImage || !this.buttonBefore || !this.buttonAfter) return;

        const imgRect = this.selectedImage.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = imgRect.top - containerRect.top;
        const bottom = imgRect.bottom - containerRect.top;
        const right = imgRect.right - containerRect.left;

        this.buttonBefore.style.top = `${top + 10}px`;
        this.buttonBefore.style.left = `${right - this.buttonBefore.offsetWidth - 10}px`;

        this.buttonAfter.style.top = `${bottom - this.buttonAfter.offsetHeight - 10}px`;
        this.buttonAfter.style.left = `${right - this.buttonAfter.offsetWidth - 10}px`;
    }

    private insertParagraphBefore() {
        if (!this.selectedImage) return;

        const blot = Quill.find(this.selectedImage);
        if (blot) {
            const index = this.quill.getIndex(blot);
            this.quill.insertText(index, '\n', 'user');
            this.quill.setSelection(index, 0, 'user');
            this.deselectImage();
        }
    }

    private insertParagraphAfter() {
        if (!this.selectedImage) return;

        const blot = Quill.find(this.selectedImage);
        if (blot) {
            const index = this.quill.getIndex(blot) + 1;
            this.quill.insertText(index, '\n', 'user');
            this.quill.setSelection(index + 1, 0, 'user');
            this.deselectImage();
        }
    }
}
