import Quill from 'quill';
const ICONS = {
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alt: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="14" height="11" rx="1"></rect><path d="M1 9 l3-3 3.5 3.5 2-2 3 2.5"></path><line x1="17" y1="8" x2="23" y2="8"></line><line x1="20" y1="8" x2="20" y2="20"></line><line x1="17" y1="20" x2="23" y2="20"></line></svg>',
  caption: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="13" rx="2"></rect><path d="M2 9 l4-4 4 4 3-3 7 5"></path><line x1="4" y1="19" x2="20" y2="19"></line><line x1="6" y1="22" x2="16" y2="22"></line></svg>',
  paraBefore: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 3H21"></path></svg>',
  paraAfter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 21H21"></path></svg>',
  sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
  rotateLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',
  rotateRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
  flipHorizontal: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5"></path><path d="M16 7l5 5-5 5"></path><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
  flipVertical: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8l5-5 5 5"></path><path d="M7 16l5 5 5-5"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>',
  reset: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
};
export default class ImageSelection {
  quill;
  options;
  selectedImage = null;
  selectedFigure = null;
  overlay = null;
  toolbar = null;
  inputBar = null;
  dragHandle = null;
  dragSide = 'right';
  dragStartX = 0;
  dragStartWidth = 0;
  repositionHandler;
  isResizing = false;
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.options = {
      borderColor: '#007bff',
      borderWidth: '4px',
      buttonBeforeLabel: ICONS.paraBefore,
      buttonAfterLabel: ICONS.paraAfter,
      buttonBeforeTitle: 'Insert a paragraph before',
      buttonAfterTitle: 'Insert a paragraph after',
      rotateLeftTitle: 'Rotate left',
      rotateRightTitle: 'Rotate right',
      flipHorizontalTitle: 'Flip horizontal',
      flipVerticalTitle: 'Flip vertical',
      resetTitle: 'Reset image',
      linkTitle: 'Edit link',
      captionBackgroundColor: 'rgba(51, 51, 51, 0.6)',
      ...options,
      alignLabels: {
        left: 'Left (wrapped)',
        leftBlock: 'Left (no wrap)',
        center: 'Center',
        right: 'Right (wrapped)',
        ...(options.alignLabels || {})
      }
    };
    this.repositionHandler = this.reposition.bind(this);
    this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
    this.quill.on('text-change', () => {
      if (!this.isResizing) {
        this.deselectImage();
      }
    });
    this.quill.root.addEventListener('scroll', this.repositionHandler, true);
    window.addEventListener('resize', this.repositionHandler);
    this.injectStyles();
  }
  injectStyles() {
    const styleId = 'ql-image-selection-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
            :root {
                --ql-caption-bg-color: ${this.options.captionBackgroundColor};
            }
            .ql-editor figure.ql-image-figure {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                line-height: 0;
            }
            .ql-editor figure.ql-image-figure figcaption {
                background: rgba(51, 51, 51, 0.60);
                color: white;
                font-size: 11px;
                padding: 4px 8px;
                text-align: center;
                font-style: italic;
                line-height: normal;
                box-sizing: border-box;
                border-radius: 0 0 4px 4px;
                pointer-events: none;
                width: 100%;
            }
            .ql-editor figure.ql-image-figure figcaption[data-empty="true"],
            .ql-editor figure.ql-image-figure figcaption:empty {
                display: none !important;
            }
            .ql-editor figure.ql-image-figure:has(img.ql-image-selected) figcaption:not([data-empty="true"]):not(:empty) {
                background: ${this.options.borderColor};
            }
            .ql-editor figure.ql-image-figure img {
                display: block;
                transition: transform 0.2s;
            }
            .ql-editor figure.ql-image-figure a {
                display: flex;
                width: 100%;
                justify-content: center;
                text-decoration: none;
                color: inherit;
            }
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
        `;
    document.head.appendChild(style);
  }
  handleClick(e) {
    const target = e.target;
    if (target instanceof HTMLImageElement && this.quill.root.contains(target)) {
      this.selectImage(target);
    } else if (this.toolbar && this.toolbar.contains(target)) {
      // Clicked toolbar
    } else if (this.inputBar && this.inputBar.contains(target)) {
      // Clicked input bar
    } else if (this.overlay && this.overlay.contains(target)) {
      // Clicked handle or overlay
    } else {
      this.deselectImage();
    }
  }
  selectImage(img) {
    if (this.selectedImage === img) return;
    this.deselectImage();
    this.selectedImage = img;
    this.selectedImage.draggable = false;
    this.selectedImage.classList.add('ql-image-selected');
    const figure = img.closest('figure');
    if (figure) {
      this.selectedFigure = figure;
    }
    this.showOverlay();
  }
  deselectImage() {
    if (this.isResizing) return;
    if (this.selectedImage) {
      this.selectedImage.draggable = true;
      this.selectedImage.classList.remove('ql-image-selected');
      this.selectedImage = null;
      this.selectedFigure = null;
    }
    this.hideOverlay();
  }
  hideOverlay() {
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
  showOverlay() {
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
  setupToolbar() {
    if (!this.toolbar) return;

    // Paragraph Before
    const btnBefore = document.createElement('button');
    btnBefore.type = 'button';
    btnBefore.innerHTML = this.options.buttonBeforeLabel;
    btnBefore.title = this.options.buttonBeforeTitle;
    btnBefore.onclick = e => {
      e.stopPropagation();
      this.insertParagraphBefore();
    };
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
      btn.onclick = e => {
        e.stopPropagation();
        this.setSize(size);
      };
      this.toolbar.appendChild(btn);
    });
    const btnCustomSize = document.createElement('button');
    btnCustomSize.type = 'button';
    btnCustomSize.innerHTML = ICONS.sizeCustom;
    btnCustomSize.title = 'Set custom width';
    btnCustomSize.onclick = e => {
      e.stopPropagation();
      this.showSizeInput();
    };
    this.toolbar.appendChild(btnCustomSize);
    this.addSeparator();

    // Alignments
    const alignments = [{
      name: 'left',
      icon: ICONS.alignLeft
    }, {
      name: 'leftBlock',
      icon: ICONS.alignLeftBlock
    }, {
      name: 'center',
      icon: ICONS.alignCenter
    }, {
      name: 'right',
      icon: ICONS.alignRight
    }];
    alignments.forEach(align => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = align.icon;
      // @ts-ignore
      btn.title = this.options.alignLabels[align.name] || align.name;
      btn.dataset.align = align.name;
      btn.onclick = e => {
        e.stopPropagation();
        this.alignImage(align.name);
      };
      this.toolbar.appendChild(btn);
    });
    this.updateActiveButtons();
    this.addSeparator();

    // Rotation
    const btnRotateLeft = document.createElement('button');
    btnRotateLeft.type = 'button';
    btnRotateLeft.innerHTML = ICONS.rotateLeft;
    btnRotateLeft.title = this.options.rotateLeftTitle;
    btnRotateLeft.onclick = e => {
      e.stopPropagation();
      this.rotateImage('left');
    };
    this.toolbar.appendChild(btnRotateLeft);
    const btnRotateRight = document.createElement('button');
    btnRotateRight.type = 'button';
    btnRotateRight.innerHTML = ICONS.rotateRight;
    btnRotateRight.title = this.options.rotateRightTitle;
    btnRotateRight.onclick = e => {
      e.stopPropagation();
      this.rotateImage('right');
    };
    this.toolbar.appendChild(btnRotateRight);

    // Flip
    const btnFlipH = document.createElement('button');
    btnFlipH.type = 'button';
    btnFlipH.innerHTML = ICONS.flipHorizontal;
    btnFlipH.title = this.options.flipHorizontalTitle;
    btnFlipH.onclick = e => {
      e.stopPropagation();
      this.flipImage('horizontal');
    };
    this.toolbar.appendChild(btnFlipH);
    const btnFlipV = document.createElement('button');
    btnFlipV.type = 'button';
    btnFlipV.innerHTML = ICONS.flipVertical;
    btnFlipV.title = this.options.flipVerticalTitle;
    btnFlipV.onclick = e => {
      e.stopPropagation();
      this.flipImage('vertical');
    };
    this.toolbar.appendChild(btnFlipV);

    // Reset
    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.innerHTML = ICONS.reset;
    btnReset.title = this.options.resetTitle;
    btnReset.onclick = e => {
      e.stopPropagation();
      this.resetImage();
    };
    this.toolbar.appendChild(btnReset);
    this.addSeparator();

    // Caption
    const btnCaption = document.createElement('button');
    btnCaption.type = 'button';
    btnCaption.innerHTML = ICONS.caption;
    btnCaption.title = 'Edit Caption';
    btnCaption.onclick = e => {
      e.stopPropagation();
      this.showCaptionInput();
    };
    const blot = this.getBlot();
    // @ts-ignore
    if (blot && blot.formats().caption) btnCaption.classList.add('active');
    this.toolbar.appendChild(btnCaption);

    // Alt text
    const btnAlt = document.createElement('button');
    btnAlt.type = 'button';
    btnAlt.innerHTML = ICONS.alt;
    btnAlt.title = 'Edit Alt Text';
    btnAlt.onclick = e => {
      e.stopPropagation();
      this.showAltInput();
    };
    this.toolbar.appendChild(btnAlt);

    // Link
    const btnLink = document.createElement('button');
    btnLink.type = 'button';
    btnLink.innerHTML = ICONS.link;
    btnLink.title = this.options.linkTitle;
    btnLink.onclick = e => {
      e.stopPropagation();
      this.showLinkInput();
    };
    // @ts-ignore
    if (blot && blot.formats().link) btnLink.classList.add('active');
    this.toolbar.appendChild(btnLink);
    this.addSeparator();

    // Paragraph After
    const btnAfter = document.createElement('button');
    btnAfter.type = 'button';
    btnAfter.innerHTML = this.options.buttonAfterLabel;
    btnAfter.title = this.options.buttonAfterTitle;
    btnAfter.onclick = e => {
      e.stopPropagation();
      this.insertParagraphAfter();
    };
    this.toolbar.appendChild(btnAfter);
  }
  showGenericInput(currentValue, placeholder, width, onSave, onClear) {
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
    btnOk.onclick = e => {
      e.stopPropagation();
      onSave(input.value);
      this.hideInputBar();
    };
    if (onClear) {
      const btnClear = document.createElement('button');
      btnClear.type = 'button';
      btnClear.innerHTML = ICONS.trash;
      btnClear.title = 'Clear value';
      btnClear.onclick = e => {
        e.stopPropagation();
        onClear();
        this.hideInputBar();
      };
      this.inputBar.appendChild(input);
      this.inputBar.appendChild(btnOk);
      this.inputBar.appendChild(btnClear);
    } else {
      this.inputBar.appendChild(input);
      this.inputBar.appendChild(btnOk);
    }
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.onclick = e => {
      e.stopPropagation();
      this.hideInputBar();
    };
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        onSave(input.value);
        this.hideInputBar();
      } else if (e.key === 'Escape') {
        this.hideInputBar();
      }
    };
    this.inputBar.appendChild(btnCancel);
    this.quill.container.appendChild(this.inputBar);
    this.reposition();
    input.focus();
    input.select();
  }
  hideInputBar() {
    if (this.inputBar) {
      this.inputBar.remove();
      this.inputBar = null;
    }
    if (this.toolbar) {
      this.toolbar.style.display = 'flex';
      this.reposition();
    }
  }
  showSizeInput() {
    let currentWidth = this.selectedImage?.style.width || Math.round(this.selectedImage?.getBoundingClientRect().width || 0) + 'px';
    if (currentWidth.endsWith('px')) {
      currentWidth = currentWidth.replace('px', '');
    }
    this.showGenericInput(currentWidth, 'e.g. 300 or 50%', '80px', val => this.setSize(val));
  }
  showAltInput() {
    const currentAlt = this.selectedImage?.getAttribute('alt') || '';
    this.showGenericInput(currentAlt, 'Alt text', '150px', val => this.setAltText(val));
  }
  showCaptionInput() {
    const blot = this.getBlot();
    // @ts-ignore
    const currentCaption = blot && blot.formats().caption || '';
    this.showGenericInput(currentCaption, 'Image caption', '200px', val => this.setCaption(val), () => this.setCaption(''));
  }
  showLinkInput() {
    const blot = this.getBlot();
    // @ts-ignore
    const currentLink = blot && blot.formats().link || '';
    this.showGenericInput(currentLink, 'https://...', '200px', val => this.setLink(val), () => this.setLink(''));
  }
  setAltText(alt) {
    this.saveFormat('alt', alt);
  }
  setLink(link) {
    const cleanLink = link.trim() || null;
    this.saveFormat('link', cleanLink);
    if (this.toolbar) {
      const btnLink = this.toolbar.querySelector(`button[title="${this.options.linkTitle}"]`);
      if (btnLink) {
        if (cleanLink) btnLink.classList.add('active');else btnLink.classList.remove('active');
      }
    }
  }
  setCaption(caption) {
    const cleanCaption = caption.trim() || null;
    this.saveFormat('caption', cleanCaption);

    // Manual refresh of the button state
    if (this.toolbar) {
      const btnCaption = this.toolbar.querySelector('button[title="Edit Caption"]');
      if (btnCaption) {
        if (cleanCaption) {
          btnCaption.classList.add('active');
        } else {
          btnCaption.classList.remove('active');
        }
      }
    }
    setTimeout(() => {
      this.reposition();
    }, 50);
  }
  saveFormat(name, value) {
    if (!this.selectedImage) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot);
      if (index >= 0) {
        this.quill.formatText(index, 1, {
          [name]: value
        }, 'user');
      }
    }
  }
  getBlot() {
    const el = this.selectedFigure || this.selectedImage;
    return el ? Quill.find(el) : null;
  }
  isCurrentAlign(name) {
    const el = this.selectedFigure || this.selectedImage;
    if (!el) return false;
    const style = el.style;
    switch (name) {
      case 'leftBlock':
        return style.display === 'block' && (style.float === 'none' || style.float === '') && (style.marginLeft === '0px' || style.marginLeft === '');
      case 'center':
        return style.display === 'block' && (style.marginLeft === 'auto' || style.margin === '10px auto' || style.margin === 'auto');
      case 'left':
        return style.float === 'left';
      case 'right':
        return style.float === 'right';
    }
    return false;
  }
  updateActiveButtons() {
    if (!this.selectedImage || !this.toolbar) return;

    // Alignments
    this.toolbar.querySelectorAll('button[data-align]').forEach(btn => {
      const buttonAlign = btn.dataset.align;
      if (buttonAlign && this.isCurrentAlign(buttonAlign)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Sizes
    this.toolbar.querySelectorAll('button[data-size]').forEach(btn => {
      const size = btn.dataset.size;
      const el = this.selectedFigure || this.selectedImage;
      if (size && el.style.width === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  addSeparator() {
    const sep = document.createElement('div');
    sep.className = 'ql-toolbar-separator';
    this.toolbar.appendChild(sep);
  }
  setupHandles() {
    if (!this.overlay) return;
    const positions = [{
      top: '-7px',
      left: '-7px',
      cursor: 'nwse-resize',
      side: 'left'
    }, {
      top: '-7px',
      right: '-7px',
      cursor: 'nesw-resize',
      side: 'right'
    }, {
      bottom: '-7px',
      left: '-7px',
      cursor: 'nesw-resize',
      side: 'left'
    }, {
      bottom: '-7px',
      right: '-7px',
      cursor: 'nwse-resize',
      side: 'right'
    }];
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
      handle.addEventListener('dragstart', e => e.preventDefault());
      this.overlay.appendChild(handle);
    });
  }
  handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    this.dragHandle = e.target;
    this.dragSide = this.dragHandle.dataset.side || 'right';
    this.dragStartX = e.clientX;
    this.dragStartWidth = this.selectedImage ? this.selectedImage.getBoundingClientRect().width : 0;
    window.addEventListener('mousemove', this.handleMouseMove, true);
    window.addEventListener('mouseup', this.handleMouseUp, true);
  }
  handleMouseMove = e => {
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
      this.applyLayout(newWidth + 'px', false);
      this.reposition();
    }
  };
  handleMouseUp = e => {
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
  saveImageStyles() {
    if (!this.selectedImage) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot);
      const el = this.selectedFigure || this.selectedImage;
      const figureStyle = el.getAttribute('style');
      const imgStyle = this.selectedImage.getAttribute('style') || null;
      this.quill.formatText(index, 1, {
        style: figureStyle,
        imgStyle: imgStyle
      }, 'user');
    }
  }
  reposition() {
    if (!this.selectedImage || !this.overlay) return;
    const imgRect = this.selectedImage.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const top = imgRect.top - containerRect.top;
    const left = imgRect.left - containerRect.left;
    this.overlay.style.top = `${top}px`;
    this.overlay.style.left = `${left}px`;
    this.overlay.style.width = `${imgRect.width}px`;
    this.overlay.style.height = `${imgRect.height}px`;
    const activeBar = this.inputBar && this.inputBar.parentNode ? this.inputBar : this.toolbar;
    if (!activeBar) return;
    const barWidth = activeBar.offsetWidth || 300;
    let barLeft = left + imgRect.width / 2 - barWidth / 2;
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
  applyLayout(width, isBaseWidth) {
    if (isBaseWidth === void 0) {
      isBaseWidth = false;
    }
    if (!this.selectedImage) return;
    const img = this.selectedImage;
    const figure = this.selectedFigure;
    const angle = this.getRotation(img);
    const isSideways = (angle % 180 + 180) % 180 === 90;
    if (!figure) {
      img.style.width = width;
      img.style.height = 'auto';
      return;
    }
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    if (!isSideways) {
      figure.style.width = width;
      figure.style.display = 'table';
      figure.style.verticalAlign = 'top';
      img.style.width = '100%';
      img.style.maxWidth = '';
      img.style.maxHeight = '';
      img.style.marginLeft = '';
      img.style.marginRight = '';
      img.style.marginTop = '';
      img.style.marginBottom = '';
      img.style.height = 'auto';
      return;
    }
    let visualWidth;
    if (isBaseWidth) {
      if (width.endsWith('%')) {
        visualWidth = parseFloat(width) / ratio + '%';
      } else {
        visualWidth = Math.round(parseFloat(width) / ratio) + 'px';
      }
    } else {
      visualWidth = width;
    }
    figure.style.width = visualWidth;
    figure.style.display = 'table';
    figure.style.verticalAlign = 'top';
    img.style.width = ratio * 100 + '%';
    img.style.height = 'auto';
    img.style.maxWidth = 'none';
    img.style.maxHeight = 'none';
    const marginH = (1 - ratio) * 50 + '%';
    const marginV = (ratio - 1) * 50 + '%';
    img.style.marginLeft = marginH;
    img.style.marginRight = marginH;
    img.style.marginTop = marginV;
    img.style.marginBottom = marginV;
  }
  setSize(size) {
    if (!this.selectedImage || !size) return;
    let finalSize = size.trim();
    if (/^\d+$/.test(finalSize)) {
      finalSize += 'px';
    }
    this.applyLayout(finalSize, false);
    this.selectedSizeUpdate(finalSize);
    this.saveImageStyles();
    this.updateActiveButtons();
    setTimeout(() => this.reposition(), 100);
  }
  selectedSizeUpdate(size) {
    if (!this.selectedImage) return;
    if (size === '100%') {
      const el = this.selectedFigure || this.selectedImage;
      el.style.display = 'table';
      el.style.margin = '10px auto';
    }
  }
  alignImage(align) {
    const el = this.selectedFigure || this.selectedImage;
    if (!el) return;
    const blot = this.getBlot();
    if (!blot) return;
    el.style.display = 'table';
    el.style.verticalAlign = 'top';
    el.style.maxWidth = '100%';
    el.style.boxSizing = 'border-box';
    el.style.float = '';
    el.style.margin = '';
    el.style.marginLeft = '';
    el.style.marginRight = '';
    el.style.marginTop = '';
    el.style.marginBottom = '';
    if (align === 'leftBlock') {
      el.style.marginLeft = '0';
      el.style.marginRight = 'auto';
      el.style.marginTop = '10px';
      el.style.marginBottom = '10px';
    } else if (align === 'center') {
      el.style.marginLeft = 'auto';
      el.style.marginRight = 'auto';
      el.style.marginTop = '10px';
      el.style.marginBottom = '10px';
    } else if (align === 'left') {
      el.style.float = 'left';
      el.style.margin = '0 10px 10px 0';
    } else if (align === 'right') {
      el.style.float = 'right';
      el.style.margin = '0 0 10px 10px';
    }
    this.saveImageStyles();
    this.updateActiveButtons();
    setTimeout(() => this.reposition(), 100);
  }
  insertParagraphBefore() {
    if (!this.selectedImage) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index, 0, 'user');
      this.deselectImage();
    }
  }
  insertParagraphAfter() {
    if (!this.selectedImage) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot) + 1;
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index + 1, 0, 'user');
      this.deselectImage();
    }
  }
  getRotation(el) {
    const transform = el.style.transform;
    if (transform) {
      const match = transform.match(/rotate\(([^)]+)\)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    return 0;
  }
  setRotation(el, angle) {
    const otherTransforms = (el.style.transform || '').replace(/rotate\([^)]+\)/g, '').trim();
    const newTransform = `rotate(${angle}deg) ${otherTransforms}`.trim();
    el.style.transform = newTransform;
  }
  getTransformState(el) {
    const transform = el.style.transform || '';
    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
    const scaleXMatch = transform.match(/scaleX\(([^)]+)\)/);
    const scaleYMatch = transform.match(/scaleY\(([^)]+)\)/);
    return {
      rotate: rotateMatch ? parseInt(rotateMatch[1], 10) : 0,
      scaleX: scaleXMatch ? parseInt(scaleXMatch[1], 10) : 1,
      scaleY: scaleYMatch ? parseInt(scaleYMatch[1], 10) : 1
    };
  }
  updateTransform(el, rotate, scaleX, scaleY) {
    el.style.transform = `rotate(${rotate}deg) scaleX(${scaleX}) scaleY(${scaleY})`.trim();
  }
  flipImage(direction) {
    if (!this.selectedImage) return;
    const img = this.selectedImage;
    const state = this.getTransformState(img);
    const isSideways = (state.rotate % 180 + 180) % 180 === 90;
    if (direction === 'horizontal') {
      // If sideways, horizontal flip on screen is vertical flip in local coordinates
      if (isSideways) state.scaleY *= -1;else state.scaleX *= -1;
    } else {
      if (isSideways) state.scaleX *= -1;else state.scaleY *= -1;
    }
    this.updateTransform(img, state.rotate, state.scaleX, state.scaleY);
    this.saveImageStyles();
    setTimeout(() => this.reposition(), 100);
  }
  resetImage() {
    if (!this.selectedImage) return;
    const img = this.selectedImage;
    const figure = this.selectedFigure;
    img.style.transform = '';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.marginLeft = '';
    img.style.marginRight = '';
    img.style.marginTop = '';
    img.style.marginBottom = '';
    img.style.maxWidth = '';
    img.style.maxHeight = '';
    if (img.parentElement?.tagName === 'A') {
      const a = img.parentElement;
      a.style.marginLeft = '';
      a.style.marginRight = '';
      a.style.marginTop = '';
      a.style.marginBottom = '';
    }
    if (figure) {
      figure.style.width = '';
      figure.style.margin = '';
      figure.style.display = 'table';
      figure.style.verticalAlign = 'top';
    }
    this.saveImageStyles();
    this.updateActiveButtons();
    setTimeout(() => this.reposition(), 100);
  }
  rotateImage(direction) {
    if (!this.selectedImage) return;
    const img = this.selectedImage;
    const figure = this.selectedFigure;
    const state = this.getTransformState(img);
    const newAngle = state.rotate + (direction === 'right' ? 90 : -90);
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    const isCurrentlySideways = (state.rotate % 180 + 180) % 180 === 90;
    let baseWidthPx;
    if (figure) {
      baseWidthPx = isCurrentlySideways ? figure.offsetWidth * ratio : figure.offsetWidth;
    } else {
      baseWidthPx = img.offsetWidth;
    }
    this.updateTransform(img, newAngle, state.scaleX, state.scaleY);
    this.applyLayout(baseWidthPx + 'px', true);
    this.saveImageStyles();
    setTimeout(() => this.reposition(), 100);
  }
}