function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GRID_ICON = '<svg viewBox="0 0 18 18" width="14" height="14"><rect x="3" y="3" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.5"/></svg>';
const STYLE_ID = 'ql-grid-borders-global';
function injectGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = "\n        .ql-editor.ql-grid-borders-active > * {\n            outline: var(--ql-grid-width, 1px) var(--ql-grid-style, dashed) var(--ql-grid-color, #d0d0d0);\n            outline-offset: calc(-1px * var(--ql-grid-width, 1px));\n        }\n        .ql-toolbar button.ql-grid-borders {\n            color: #444 !important;\n        }\n        .ql-toolbar button.ql-grid-borders:hover,\n        .ql-toolbar button.ql-grid-borders.ql-grid-borders-btn-active {\n            color: #06c !important;\n        }\n    ";
  document.head.appendChild(style);
}
function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}
const DEFAULTS = {
  active: false,
  borderColor: '#d0d0d0',
  borderWidth: 1,
  borderStyle: 'dashed',
  toggleButton: true
};
export default class GridBorders {
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.enabled = void 0;
    this.btn = null;
    this.formatsSpan = null;
    this.quill = quill;
    this.options = _extends({}, DEFAULTS, pick(options, Object.keys(DEFAULTS)));
    this.enabled = this.options.active;
    injectGlobalStyles();
    if (this.options.toggleButton) {
      this.addToolbarButton();
    }
    if (this.enabled) {
      this.show();
    }
  }
  applyCSSProperties() {
    const root = this.quill.root;
    root.style.setProperty('--ql-grid-color', this.options.borderColor);
    root.style.setProperty('--ql-grid-width', this.options.borderWidth + "px");
    root.style.setProperty('--ql-grid-style', this.options.borderStyle);
  }
  addToolbarButton() {
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
    this.btn.onclick = e => {
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
  isVisible() {
    return this.enabled;
  }
}