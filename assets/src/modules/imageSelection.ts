import Quill from 'quill';

export interface ImageSelectionOptions {
    borderColor?: string;
    borderWidth?: string;
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
}

const ICONS = {
    alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
    alt: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>',
    caption: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="13" y2="12"></line></svg>',
    paraBefore: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 3H21"></path></svg>',
    paraAfter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 21H21"></path></svg>',
    sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
};

export default class ImageSelection {
    private quill: Quill;
    private options: ImageSelectionOptions;
    private selectedImage: HTMLImageElement | null = null;
    private overlay: HTMLDivElement | null = null;
    private toolbar: HTMLDivElement | null = null;
    private inputBar: HTMLDivElement | null = null;
    private captionsMap: Map<HTMLImageElement, HTMLDivElement> = new Map();
    private dragHandle: HTMLDivElement | null = null;
    private dragSide: 'left' | 'right' = 'right';
    private dragStartX = 0;
    private dragStartWidth = 0;
    private repositionHandler: () => void;
    private isResizing = false;

    constructor(quill: Quill, options: ImageSelectionOptions = {}) {
        this.quill = quill;
        this.options = {
            borderColor: '#007bff',
            borderWidth: '4px',
            buttonBeforeLabel: ICONS.paraBefore,
            buttonAfterLabel: ICONS.paraAfter,
            buttonBeforeTitle: 'Insert a paragraph before',
            buttonAfterTitle: 'Insert a paragraph after',
            alignLabels: {
                left: 'Left (wrapped)',
                leftBlock: 'Left (no wrap)',
                center: 'Center',
                right: 'Right (wrapped)'
            },
            ...options
        };
        this.repositionHandler = this.reposition.bind(this);

        this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
        
        this.quill.on('text-change', () => {
            if (!this.isResizing) {
                this.deselectImage();
            }
            this.updateAllCaptions();
        });
        
        this.quill.root.addEventListener('scroll', this.repositionHandler, true);
        window.addEventListener('resize', this.repositionHandler);

        this.injectStyles();
        
        // Initial render of captions
        setTimeout(() => this.updateAllCaptions(), 100);
    }

    private injectStyles() {
        const styleId = 'ql-image-selection-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .ql-image-overlay {
                position: absolute;
                border: ${this.options.borderWidth} solid ${this.options.borderColor};
                box-sizing: border-box;
                pointer-events: none;
                z-index: 1000;
                user-select: none;
                -webkit-user-select: none;
            }
            .ql-image-handle {
                position: absolute;
                width: 14px;
                height: 14px;
                background: ${this.options.borderColor};
                border: 1px solid white;
                pointer-events: auto;
                cursor: nwse-resize;
                z-index: 1001;
                box-sizing: border-box;
            }
            .ql-image-toolbar, .ql-image-input-bar {
                position: absolute;
                background: #333;
                border-radius: 4px;
                padding: 4px;
                display: flex;
                gap: 4px;
                z-index: 1002;
                pointer-events: auto;
                user-select: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                align-items: center;
            }
            .ql-image-toolbar button, .ql-image-input-bar button {
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
            .ql-image-toolbar button:hover, .ql-image-input-bar button:hover {
                background: #444;
                color: white;
            }
            .ql-image-toolbar button.active {
                background: ${this.options.borderColor} !important;
                color: white !important;
            }
            .ql-image-input-bar input {
                background: #444;
                border: 1px solid #555;
                color: white;
                border-radius: 3px;
                padding: 4px 8px;
                font-size: 12px;
                outline: none;
            }
            .ql-image-input-bar input:focus {
                border-color: ${this.options.borderColor};
            }
            .ql-image-toolbar .ql-toolbar-separator {
                width: 1px;
                background: #444;
                margin: 4px 2px;
                height: 16px;
            }
            .ql-image-caption-display {
                position: absolute;
                background: rgba(51, 51, 51, 0.8);
                color: white;
                font-size: 11px;
                padding: 3px 8px;
                border-radius: 0 0 4px 4px;
                z-index: 999;
                text-align: center;
                box-sizing: border-box;
                pointer-events: none;
                font-style: italic;
                transition: background 0.2s;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ql-image-caption-display.active {
                background: ${this.options.borderColor};
                z-index: 1001;
            }
        `;
        document.head.appendChild(style);
    }

    private handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target instanceof HTMLImageElement && this.quill.root.contains(target)) {
            this.selectImage(target);
        } else if (this.toolbar && this.toolbar.contains(target)) {
            // Clicked toolbar, do nothing
        } else if (this.inputBar && this.inputBar.contains(target)) {
            // Clicked input bar, do nothing
        } else if (this.overlay && this.overlay.contains(target)) {
            // Clicked handle or overlay
        } else {
            this.deselectImage();
        }
    }

    private selectImage(img: HTMLImageElement) {
        if (this.selectedImage === img) return;
        this.deselectImage();

        this.selectedImage = img;
        this.selectedImage.draggable = false;
        
        this.showOverlay();
        this.updateAllCaptions();
    }

    private deselectImage() {
        if (this.isResizing) return;

        if (this.selectedImage) {
            this.selectedImage.draggable = true;
            const oldImg = this.selectedImage;
            this.selectedImage = null;
            // Update the caption style of the previously selected image
            const caption = this.captionsMap.get(oldImg);
            if (caption) caption.classList.remove('active');
        }
        this.hideOverlay();
    }

    private hideOverlay() {
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

    private showOverlay() {
        if (!this.selectedImage) return;

        this.overlay = document.createElement('div');
        this.overlay.className = 'ql-image-overlay';
        this.quill.container.appendChild(this.overlay);

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'ql-image-toolbar';
        this.quill.container.appendChild(this.toolbar);

        this.setupToolbar();
        this.setupHandles();
        this.reposition();
    }

    private updateAllCaptions() {
        const images = this.quill.root.querySelectorAll('img[data-caption]');
        const currentImages = new Set<HTMLImageElement>();

        images.forEach((img) => {
            const htmlImg = img as HTMLImageElement;
            currentImages.add(htmlImg);
            const captionText = htmlImg.getAttribute('data-caption') || '';

            let captionDiv = this.captionsMap.get(htmlImg);
            if (!captionDiv) {
                captionDiv = document.createElement('div');
                captionDiv.className = 'ql-image-caption-display';
                this.quill.container.appendChild(captionDiv);
                this.captionsMap.set(htmlImg, captionDiv);
            }

            captionDiv.textContent = captionText;
            if (this.selectedImage === htmlImg) {
                captionDiv.classList.add('active');
            } else {
                captionDiv.classList.remove('active');
            }
            
            this.positionCaption(htmlImg, captionDiv);
        });

        // Cleanup deleted images
        this.captionsMap.forEach((div, img) => {
            if (!currentImages.has(img) || !this.quill.root.contains(img)) {
                div.remove();
                this.captionsMap.delete(img);
            }
        });
    }

    private positionCaption(img: HTMLImageElement, div: HTMLDivElement) {
        const imgRect = img.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = imgRect.top - containerRect.top;
        const left = imgRect.left - containerRect.left;

        div.style.top = `${top + imgRect.height}px`;
        div.style.left = `${left}px`;
        div.style.width = `${imgRect.width}px`;
        
        // Hide if image is not visible in viewport or too small
        if (imgRect.width < 20 || imgRect.height < 20) {
            div.style.display = 'none';
        } else {
            div.style.display = 'block';
        }
    }

    private setupToolbar() {
        if (!this.toolbar) return;

        // Paragraph Before
        const btnBefore = document.createElement('button');
        btnBefore.type = 'button';
        btnBefore.innerHTML = this.options.buttonBeforeLabel!;
        btnBefore.title = this.options.buttonBeforeTitle!;
        btnBefore.onclick = (e) => { e.stopPropagation(); this.insertParagraphBefore(); };
        this.toolbar.appendChild(btnBefore);

        this.addSeparator();

        // Sizes
        const sizes = ['25%', '50%', '75%', '100%'];
        sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = size;
            btn.title = `Set width to ${size}`;
            btn.dataset.size = size;
            btn.onclick = (e) => { e.stopPropagation(); this.setSize(size); };
            this.toolbar!.appendChild(btn);
        });

        const btnCustomSize = document.createElement('button');
        btnCustomSize.type = 'button';
        btnCustomSize.innerHTML = ICONS.sizeCustom;
        btnCustomSize.title = 'Set custom width';
        btnCustomSize.onclick = (e) => { e.stopPropagation(); this.showSizeInput(); };
        this.toolbar.appendChild(btnCustomSize);

        this.addSeparator();

        // Alignments
        const alignments = [
            { name: 'left', icon: ICONS.alignLeft },
            { name: 'left-block', icon: ICONS.alignLeftBlock },
            { name: 'center', icon: ICONS.alignCenter },
            { name: 'right', icon: ICONS.alignRight }
        ];

        alignments.forEach(align => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = align.icon;
            // @ts-ignore
            btn.title = this.options.alignLabels[align.name];
            btn.dataset.align = align.name;
            btn.onclick = (e) => { e.stopPropagation(); this.alignImage(align.name); };
            this.toolbar!.appendChild(btn);
        });
        
        this.updateActiveButtons();

        this.addSeparator();

        // Caption
        const btnCaption = document.createElement('button');
        btnCaption.type = 'button';
        btnCaption.innerHTML = ICONS.caption;
        btnCaption.title = 'Edit Caption';
        btnCaption.onclick = (e) => { e.stopPropagation(); this.showCaptionInput(); };
        if (this.selectedImage?.hasAttribute('data-caption')) btnCaption.classList.add('active');
        this.toolbar.appendChild(btnCaption);

        // Alt text
        const btnAlt = document.createElement('button');
        btnAlt.type = 'button';
        btnAlt.innerHTML = ICONS.alt;
        btnAlt.title = 'Edit Alt Text';
        btnAlt.onclick = (e) => { e.stopPropagation(); this.showAltInput(); };
        this.toolbar.appendChild(btnAlt);

        this.addSeparator();

        // Paragraph After
        const btnAfter = document.createElement('button');
        btnAfter.type = 'button';
        btnAfter.innerHTML = this.options.buttonAfterLabel!;
        btnAfter.title = this.options.buttonAfterTitle!;
        btnAfter.onclick = (e) => { e.stopPropagation(); this.insertParagraphAfter(); };
        this.toolbar.appendChild(btnAfter);
    }

    private showGenericInput(currentValue: string, placeholder: string, width: string, onSave: (val: string) => void) {
        if (this.toolbar) this.toolbar.style.display = 'none';
        
        this.inputBar = document.createElement('div');
        this.inputBar.className = 'ql-image-input-bar';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.placeholder = placeholder;
        input.style.width = width;
        
        const btnOk = document.createElement('button');
        btnOk.type = 'button';
        btnOk.innerHTML = ICONS.check;
        btnOk.onclick = (e) => { 
            e.stopPropagation(); 
            onSave(input.value); 
            this.hideInputBar(); 
        };

        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerHTML = ICONS.cancel;
        btnCancel.onclick = (e) => { 
            e.stopPropagation(); 
            this.hideInputBar(); 
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                onSave(input.value);
                this.hideInputBar();
            } else if (e.key === 'Escape') {
                this.hideInputBar();
            }
        };

        this.inputBar.appendChild(input);
        this.inputBar.appendChild(btnOk);
        this.inputBar.appendChild(btnCancel);
        this.quill.container.appendChild(this.inputBar);
        
        this.reposition();
        input.focus();
        input.select();
    }

    private hideInputBar() {
        if (this.inputBar) {
            this.inputBar.remove();
            this.inputBar = null;
        }
        if (this.toolbar) {
            this.toolbar.style.display = 'flex';
            this.reposition();
        }
    }

    private showSizeInput() {
        let currentWidth = this.selectedImage?.style.width || Math.round(this.selectedImage?.getBoundingClientRect().width || 0) + 'px';
        if (currentWidth.endsWith('px')) {
            currentWidth = currentWidth.replace('px', '');
        }
        
        this.showGenericInput(currentWidth, 'e.g. 300 or 50%', '80px', (val) => this.setSize(val));
    }

    private showAltInput() {
        const currentAlt = this.selectedImage?.getAttribute('alt') || '';
        this.showGenericInput(currentAlt, 'Alt text', '150px', (val) => this.setAltText(val));
    }

    private showCaptionInput() {
        const currentCaption = this.selectedImage?.getAttribute('data-caption') || '';
        this.showGenericInput(currentCaption, 'Image caption', '200px', (val) => this.setCaption(val));
    }

    private setAltText(alt: string) {
        if (!this.selectedImage) return;
        this.selectedImage.setAttribute('alt', alt);
        const blot = Quill.find(this.selectedImage);
        // @ts-ignore
        if (blot && blot.format) blot.format('alt', alt);
    }

    private setCaption(caption: string) {
        if (!this.selectedImage) return;
        
        const blot = Quill.find(this.selectedImage);
        if (caption.trim()) {
            this.selectedImage.setAttribute('data-caption', caption);
            // @ts-ignore
            if (blot && blot.format) blot.format('caption', caption);
        } else {
            this.selectedImage.removeAttribute('data-caption');
            // @ts-ignore
            if (blot && blot.format) blot.format('caption', null);
        }
        
        this.updateAllCaptions();
        
        this.toolbar?.querySelectorAll('button').forEach(btn => {
            if (btn.title === 'Edit Caption') {
                if (caption.trim()) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });

        this.reposition();
    }

    private isCurrentAlign(name: string): boolean {
        if (!this.selectedImage) return false;
        const style = this.selectedImage.style;
        
        switch(name) {
            case 'left-block': 
                return style.display === 'block' && 
                       (style.float === 'none' || style.float === '') && 
                       (style.marginLeft === '0px' || style.marginLeft === '');
            case 'center': 
                return style.display === 'block' && 
                       (style.marginLeft === 'auto' || style.margin === '10px auto' || style.margin === 'auto');
            case 'left': return style.float === 'left';
            case 'right': return style.float === 'right';
        }
        return false;
    }

    private updateActiveButtons() {
        if (!this.selectedImage || !this.toolbar) return;

        // Alignments
        this.toolbar.querySelectorAll('button[data-align]').forEach(btn => {
            const buttonAlign = (btn as HTMLElement).dataset.align;
            if (buttonAlign && this.isCurrentAlign(buttonAlign)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Sizes
        this.toolbar.querySelectorAll('button[data-size]').forEach(btn => {
            const size = (btn as HTMLElement).dataset.size;
            if (size && this.selectedImage!.style.width === size) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    private addSeparator() {
        const sep = document.createElement('div');
        sep.className = 'ql-toolbar-separator';
        this.toolbar!.appendChild(sep);
    }

    private setupHandles() {
        if (!this.overlay) return;

        const positions = [
            { top: '-7px', left: '-7px', cursor: 'nwse-resize', side: 'left' },
            { top: '-7px', right: '-7px', cursor: 'nesw-resize', side: 'right' },
            { bottom: '-7px', left: '-7px', cursor: 'nesw-resize', side: 'left' },
            { bottom: '-7px', right: '-7px', cursor: 'nwse-resize', side: 'right' },
        ];

        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = 'ql-image-handle';
            if (pos.top) handle.style.top = pos.top;
            if (pos.bottom) handle.style.bottom = pos.bottom;
            if (pos.left) handle.style.left = pos.left;
            if (pos.right) handle.style.right = pos.right;
            handle.style.cursor = pos.cursor;
            handle.dataset.side = pos.side;
            
            handle.addEventListener('mousedown', this.handleMouseDown.bind(this));
            handle.addEventListener('dragstart', (e) => e.preventDefault());
            
            this.overlay!.appendChild(handle);
        });
    }

    private handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        this.dragHandle = e.target as HTMLDivElement;
        this.dragSide = (this.dragHandle.dataset.side as 'left' | 'right') || 'right';
        this.dragStartX = e.clientX;
        this.dragStartWidth = this.selectedImage ? this.selectedImage.getBoundingClientRect().width : 0;

        window.addEventListener('mousemove', this.handleMouseMove, true);
        window.addEventListener('mouseup', this.handleMouseUp, true);
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.selectedImage || !this.dragHandle) return;

        e.preventDefault();
        e.stopPropagation();

        const deltaX = e.clientX - this.dragStartX;
        let newWidth = this.dragStartWidth;
        
        if (this.dragSide === 'right') {
            newWidth += deltaX;
        } else {
            newWidth -= deltaX;
        }

        newWidth = Math.round(newWidth);

        if (newWidth > 30) {
            this.selectedImage.style.width = `${newWidth}px`;
            this.selectedImage.style.height = 'auto';
            this.reposition();
        }
    };

    private handleMouseUp = (e: MouseEvent) => {
        if (!this.isResizing) return;
        
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = false;
        this.dragHandle = null;
        window.removeEventListener('mousemove', this.handleMouseMove, true);
        window.removeEventListener('mouseup', this.handleMouseUp, true);
        
        if (this.selectedImage) {
            this.saveImageStyles();
        }
    };

    private saveImageStyles() {
        if (!this.selectedImage) return;
        const blot = Quill.find(this.selectedImage);
        if (blot && (blot as any).format) {
            (blot as any).format('width', this.selectedImage.style.width);
            (blot as any).format('style', this.selectedImage.getAttribute('style'));
        }
    }

    private reposition() {
        this.updateAllCaptions();

        if (!this.selectedImage || !this.overlay) return;

        const imgRect = this.selectedImage.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        const top = imgRect.top - containerRect.top;
        const left = imgRect.left - containerRect.left;

        this.overlay.style.top = `${top}px`;
        this.overlay.style.left = `${left}px`;
        this.overlay.style.width = `${imgRect.width}px`;
        this.overlay.style.height = `${imgRect.height}px`;

        const activeBar = (this.inputBar && this.inputBar.parentNode) ? this.inputBar : this.toolbar;
        if (!activeBar) return;

        const barWidth = activeBar.offsetWidth || 300;
        let barLeft = left + (imgRect.width / 2) - (barWidth / 2);
        
        if (barLeft < 5) barLeft = 5;
        const maxLeft = containerRect.width - barWidth - 5;
        if (barLeft > maxLeft) barLeft = maxLeft;

        activeBar.style.left = `${barLeft}px`;

        const barHeight = activeBar.offsetHeight || 40;
        let barTop = top - barHeight - 10;

        if (barTop < 0) {
            barTop = 5; 
        }

        activeBar.style.top = `${barTop}px`;
    }

    private setSize(size: string) {
        if (!this.selectedImage || !size) return;
        
        let finalSize = size.trim();
        if (/^\d+$/.test(finalSize)) {
            finalSize += 'px';
        }

        this.selectedImage.style.width = finalSize;
        this.selectedSizeUpdate(finalSize);
        this.selectedImage.style.height = 'auto';
        this.saveImageStyles();
        this.updateActiveButtons();
        setTimeout(() => this.reposition(), 100);
    }

    private selectedSizeUpdate(size: string) {
        if (!this.selectedImage) return;
        if (size === '100%') {
            this.selectedImage.style.display = 'block';
            this.selectedImage.style.margin = '10px auto';
        }
    }

    private alignImage(align: string) {
        if (!this.selectedImage) return;
        const blot = Quill.find(this.selectedImage);
        if (!blot) return;

        this.selectedImage.style.display = '';
        this.selectedImage.style.float = '';
        this.selectedImage.style.margin = '';
        this.selectedImage.style.marginLeft = '';
        this.selectedImage.style.marginRight = '';
        this.selectedImage.style.marginTop = '';
        this.selectedImage.style.marginBottom = '';

        if (align === 'left-block') {
            this.selectedImage.style.display = 'block';
            this.selectedImage.style.marginLeft = '0';
            this.selectedImage.style.marginRight = 'auto';
            this.selectedImage.style.marginTop = '10px';
            this.selectedImage.style.marginBottom = '10px';
        } else if (align === 'center') {
            this.selectedImage.style.display = 'block';
            this.selectedImage.style.marginLeft = 'auto';
            this.selectedImage.style.marginRight = 'auto';
            this.selectedImage.style.marginTop = '10px';
            this.selectedImage.style.marginBottom = '10px';
        } else if (align === 'left') {
            this.selectedImage.style.float = 'left';
            this.selectedImage.style.margin = '0 10px 10px 0';
        } else if (align === 'right') {
            this.selectedImage.style.float = 'right';
            this.selectedImage.style.margin = '0 0 10px 10px';
        }

        this.saveImageStyles();
        this.updateActiveButtons();
        setTimeout(() => this.reposition(), 100);
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
