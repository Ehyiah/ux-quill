import Quill from 'quill';
const icons = Quill.import('ui/icons');
const defaultIcon = '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M5 3C4 3 3 4 3 5L3 7C3 8 2 9 2 9C2 9 3 10 3 11L3 13C3 14 4 15 5 15"></path><path class="ql-stroke" d="M13 3C14 3 15 4 15 5L15 7C15 8 16 9 16 9C16 9 15 10 15 11L15 13C15 14 14 15 13 15"></path><circle class="ql-fill" cx="7" cy="9" r="1"></circle><circle class="ql-fill" cx="11" cy="9" r="1"></circle></svg>';
icons['placeholder'] = defaultIcon;
export class PlaceholderModule {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.placeholders = void 0;
    this.dropdown = void 0;
    this.button = void 0;
    this.startTag = void 0;
    this.endTag = void 0;
    this.quill = quill;
    this.options = options;
    this.placeholders = options.placeholders || [];
    this.startTag = options.startTag || '{{';
    this.endTag = options.endTag || '}}';
    this.injectStyles();
    if (options.icon) {
      icons['placeholder'] = options.icon;
    }
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      this.addButton(toolbar);

      document.addEventListener('click', e => {
        if (!this.button.contains(e.target) && !this.dropdown.contains(e.target)) {
          this.dropdown.style.display = 'none';
        }
      });
    }
  }
  injectStyles() {
    const id = 'ql-placeholder-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            button.ql-placeholder {\n                width: 28px;\n                height: 24px;\n            }\n            button.ql-placeholder svg {\n                width: 18px;\n                height: 18px;\n            }\n            .ql-placeholder-dropdown {\n                position: absolute;\n                background-color: #fff;\n                border: 1px solid #ccc;\n                border-radius: 4px;\n                z-index: 1000;\n                margin-top: 2px;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                min-width: 150px;\n                max-height: 300px;\n                overflow-y: auto;\n            }\n            .ql-placeholder-item {\n                padding: 8px 12px;\n                cursor: pointer;\n                white-space: nowrap;\n            }\n            .ql-placeholder-item:hover {\n                background-color: #f0f0f0;\n            }\n        ";
    document.head.appendChild(style);
  }
  addButton(toolbar) {
    var _this$button$parentEl;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'ql-placeholder';
    this.button.setAttribute('aria-label', 'placeholder');
    const iconSvg = icons['placeholder'];
    if (iconSvg) {
      this.button.innerHTML = iconSvg;
    }
    this.button.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    };
    let container = toolbar.container.querySelector('.ql-formats');
    if (!container) {
      container = document.createElement('span');
      container.className = 'ql-formats';
      toolbar.container.appendChild(container);
    }
    container.appendChild(this.button);
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ql-placeholder-dropdown';
    this.dropdown.style.display = 'none';
    this.placeholders.forEach(ph => {
      const item = document.createElement('div');
      item.className = 'ql-placeholder-item';
      item.innerHTML = ph;
      item.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        this.insertPlaceholder(ph);
        this.toggleDropdown();
      };
      this.dropdown.appendChild(item);
    });
    (_this$button$parentEl = this.button.parentElement) == null || _this$button$parentEl.appendChild(this.dropdown);
  }
  toggleDropdown() {
    this.dropdown.style.display = this.dropdown.style.display === 'none' ? 'block' : 'none';
  }
  insertPlaceholder(placeholder) {
    const range = this.quill.getSelection(true);
    if (range) {
      const text = "" + this.startTag + placeholder + this.endTag;
      this.quill.insertText(range.index, text);
      this.quill.setSelection(range.index + text.length, 0);
    }
  }
}