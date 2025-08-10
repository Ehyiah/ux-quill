export default class ReadingTime {
  quill;
  wpm;
  label;
  suffix;
  targetElement;
  readTimeOk;
  readTimeMedium;
  toolbarContainer = null;
  toolbarOriginalPaddingRight = null;
  targetIsCustom = false;
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.wpm = options.wpm || 200;
    this.label = options.label || '⏱ Temps de lecture : ~';
    this.suffix = options.suffix || ' min';
    this.readTimeOk = options.readTimeOk || 2;
    this.readTimeMedium = options.readTimeMedium || 5;
    if (options.target) {
      const el = document.querySelector(options.target);
      if (!el) {
        throw new Error(`Impossible de trouver l'élément cible : ${options.target}`);
      }
      this.targetElement = el;
      this.targetIsCustom = true;
    } else {
      this.targetElement = document.createElement('div');
      this.targetElement.classList.add('ql-reading-time');
      this.targetElement.style.cssText = `
                font-size: 12px;
                font-weight: 500;
                padding: 4px 10px;
                border-radius: 6px;
                background: #f5f5f5;
                color: #2e7d32;
                font-family: sans-serif;
                transition: background 0.3s ease, color 0.3s ease;
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                box-sizing: border-box;
                min-width: 48px; /* fixe un minimum pour stabiliser la largeur */
            `;
      const toolbar = this.quill.getModule('toolbar');
      if (toolbar?.container) {
        const tb = toolbar.container;
        if (window.getComputedStyle(tb).position === 'static') {
          tb.style.position = 'relative';
        }
        tb.appendChild(this.targetElement);
        this.toolbarContainer = tb;
        this.toolbarOriginalPaddingRight = window.getComputedStyle(tb).paddingRight || '';
      } else {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        this.quill.container.parentNode?.insertBefore(wrapper, this.quill.container);
        wrapper.appendChild(this.quill.container);
        wrapper.appendChild(this.targetElement);
        this.toolbarContainer = wrapper;
        this.toolbarOriginalPaddingRight = window.getComputedStyle(wrapper).paddingRight || '';
      }
    }
    this.updateReadingTime();
    this.quill.on('text-change', () => this.updateReadingTime());
    window.addEventListener('resize', this.onWindowResize);
  }
  onWindowResize = () => {
    if (this.toolbarContainer && !this.targetIsCustom) {
      const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
      this.toolbarContainer.style.paddingRight = `${width + 12}px`;
    }
  };
  updateReadingTime() {
    const text = this.quill.getText().trim();
    const words = text.length > 0 ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / this.wpm));
    if (minutes <= this.readTimeOk) {
      this.setStyle('#2e7d32', '#e8f5e9');
    } else if (minutes <= this.readTimeMedium) {
      this.setStyle('#ef6c00', '#fff3e0');
    } else {
      this.setStyle('#c62828', '#ffebee');
    }
    this.targetElement.textContent = `${this.label}${minutes}${this.suffix}`;
    if (this.toolbarContainer && !this.targetIsCustom) {
      const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
      this.toolbarContainer.style.paddingRight = `${width + 12}px`; // 12px marge
    }
  }
  setStyle(color, background) {
    this.targetElement.style.color = color;
    this.targetElement.style.background = background;
  }
  destroy() {
    if (this.toolbarContainer && this.toolbarOriginalPaddingRight !== null && !this.targetIsCustom) {
      this.toolbarContainer.style.paddingRight = this.toolbarOriginalPaddingRight;
    }
    if (!this.targetIsCustom && this.targetElement.parentNode) {
      this.targetElement.parentNode.removeChild(this.targetElement);
    }
    window.removeEventListener('resize', this.onWindowResize);
  }
}