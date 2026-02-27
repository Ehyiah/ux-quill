export default class ReadingTime {
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.wpm = void 0;
    this.label = void 0;
    this.suffix = void 0;
    this.targetElement = void 0;
    this.readTimeOk = void 0;
    this.readTimeMedium = void 0;
    this.toolbarContainer = null;
    this.toolbarOriginalPaddingRight = null;
    this.targetIsCustom = false;
    this.onWindowResize = () => {
      if (this.toolbarContainer && !this.targetIsCustom) {
        const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
        this.toolbarContainer.style.paddingRight = width + 12 + "px";
      }
    };
    this.quill = quill;
    this.wpm = options.wpm || 200;
    this.label = options.label || '⏱ Reading time: ~ ';
    this.suffix = options.suffix || ' minute(s)';
    this.readTimeOk = options.readTimeOk || 5;
    this.readTimeMedium = options.readTimeMedium || 8;
    if (options.target) {
      const el = document.querySelector(options.target);
      if (!el) {
        throw new Error("Cannot find target element: " + options.target);
      }
      this.targetElement = el;
      this.targetIsCustom = true;
    } else {
      this.targetElement = document.createElement('div');
      this.targetElement.classList.add('ql-reading-time');
      this.targetElement.style.cssText = "\n                font-size: 12px;\n                font-weight: 500;\n                padding: 4px 10px;\n                border-radius: 6px;\n                background: #f5f5f5;\n                color: #2e7d32;\n                font-family: sans-serif;\n                transition: background 0.3s ease, color 0.3s ease;\n                position: absolute;\n                right: 10px;\n                top: 50%;\n                transform: translateY(-50%);\n                pointer-events: none;\n                box-sizing: border-box;\n                min-width: 48px; /* minimum to stabilise width */\n            ";
      const toolbar = this.quill.getModule('toolbar');
      if (toolbar != null && toolbar.container) {
        const tb = toolbar.container;
        if (window.getComputedStyle(tb).position === 'static') {
          tb.style.position = 'relative';
        }
        tb.appendChild(this.targetElement);
        this.toolbarContainer = tb;
        this.toolbarOriginalPaddingRight = window.getComputedStyle(tb).paddingRight || '';
      } else {
        var _this$quill$container;
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        (_this$quill$container = this.quill.container.parentNode) == null || _this$quill$container.insertBefore(wrapper, this.quill.container);
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
    this.targetElement.textContent = "" + this.label + minutes + this.suffix;
    this.dispatch('reading-time:update', {
      minutes,
      words
    });
    if (this.toolbarContainer && !this.targetIsCustom) {
      const width = Math.ceil(this.targetElement.getBoundingClientRect().width);
      this.toolbarContainer.style.paddingRight = width + 12 + "px"; // 12px marge
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
  dispatch(name, detail) {
    this.quill.container.dispatchEvent(new CustomEvent("quill:" + name, {
      bubbles: true,
      cancelable: true,
      detail: detail
    }));
  }
}