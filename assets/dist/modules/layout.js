function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
import LayoutBlot, { LayoutColumnBlot } from "../blots/layout.js";
Quill.register(LayoutBlot);
Quill.register(LayoutColumnBlot);
const DEFAULT_OPTIONS = {
  presets: [{
    cols: 2,
    ratios: ['1fr', '1fr'],
    label: '50/50'
  }, {
    cols: 2,
    ratios: ['1fr', '2fr'],
    label: '30/70'
  }, {
    cols: 2,
    ratios: ['2fr', '1fr'],
    label: '70/30'
  }, {
    cols: 3,
    ratios: ['1fr', '1fr', '1fr'],
    label: '3 colonnes'
  }],
  allow_wrap: true
};
export class Layout {
  constructor(quill, userOptions) {
    if (userOptions === void 0) {
      userOptions = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.dropdownEl = null;
    this.onOutsideClick = () => {
      this.removeDropdown();
    };
    this.quill = quill;
    this.options = _extends({}, DEFAULT_OPTIONS, userOptions);
    this.injectStyles();
    this.setupToolbarHandler();
    this.setupTabNavigation();
  }
  injectStyles() {
    const id = 'quill-layout-editor-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-editor .ql-layout {\n                position: relative;\n            }\n            .ql-editor .ql-layout-col {\n                min-height: 48px;\n                padding: 8px;\n                border: 1px dashed #c0c0c0;\n                border-radius: 4px;\n                outline: none;\n                transition: border-color 0.15s, box-shadow 0.15s;\n            }\n            .ql-editor .ql-layout-col:focus {\n                border-color: #4a90d9;\n                border-style: solid;\n                box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);\n            }\n            .ql-editor .ql-layout-col p:first-child {\n                margin-top: 0;\n            }\n            .ql-editor .ql-layout-col p:last-child {\n                margin-bottom: 0;\n            }\n            .ql-layout-picker {\n                position: fixed;\n                z-index: 1000;\n                background: #fff;\n                border: 1px solid #ccc;\n                border-radius: 4px;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                padding: 4px 0;\n                min-width: 140px;\n            }\n            .ql-layout-picker button {\n                display: block;\n                width: 100%;\n                padding: 6px 16px;\n                border: none;\n                background: none;\n                text-align: left;\n                cursor: pointer;\n                font-size: 14px;\n                line-height: 1.5;\n            }\n            .ql-layout-picker button:hover {\n                background: #e8f0fe;\n            }\n        ";
    document.head.appendChild(style);
  }
  setupToolbarHandler() {
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar) return;
    toolbar.addHandler('layout', this.onToolbarClick.bind(this));
  }
  onToolbarClick() {
    const range = this.quill.getSelection(true);
    if (!range) return;
    if (range.length > 0 && this.options.allow_wrap) {
      this.showPresetPicker(preset => {
        this.wrapSelection(range, preset);
      });
    } else {
      this.showPresetPicker(preset => {
        this.insertEmptyLayout(range.index, preset);
      });
    }
  }
  showPresetPicker(onSelect) {
    this.removeDropdown();
    const toolbar = this.quill.getModule('toolbar');
    let referenceEl = null;
    if (toolbar) {
      var _container;
      const buttons = (_container = toolbar.container) == null ? void 0 : _container.querySelectorAll('button');
      if (buttons) {
        for (const btn of buttons) {
          if (btn.classList.contains('ql-layout')) {
            referenceEl = btn;
            break;
          }
        }
      }
    }
    const dropdown = document.createElement('div');
    dropdown.className = 'ql-layout-picker';
    this.dropdownEl = dropdown;
    this.options.presets.forEach(preset => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = preset.label;
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        this.removeDropdown();
        onSelect(preset);
      });
      dropdown.appendChild(btn);
    });
    document.body.appendChild(dropdown);
    if (referenceEl) {
      const rect = referenceEl.getBoundingClientRect();
      dropdown.style.top = rect.bottom + 4 + "px";
      dropdown.style.left = rect.left + "px";
    } else {
      dropdown.style.top = '40px';
      dropdown.style.left = '0';
    }
    setTimeout(() => {
      document.addEventListener('click', this.onOutsideClick, {
        once: true
      });
    }, 0);
  }
  removeDropdown() {
    if (this.dropdownEl) {
      this.dropdownEl.remove();
      this.dropdownEl = null;
    }
  }
  insertEmptyLayout(index, preset) {
    const value = {
      cols: preset.cols,
      ratios: preset.ratios,
      columns: Array(preset.cols).fill('<p><br></p>')
    };
    this.quill.insertEmbed(index, 'layout', value, 'user');
  }
  wrapSelection(range, preset) {
    const delta = this.quill.getContents(range.index, range.length);
    const html = this.convertDeltaToHtml(delta);
    const splits = this.splitContent(html, preset.cols);
    this.quill.deleteText(range.index, range.length, 'user');
    const value = {
      cols: preset.cols,
      ratios: preset.ratios,
      columns: splits
    };
    this.quill.insertEmbed(range.index, 'layout', value, 'user');
  }
  convertDeltaToHtml(delta) {
    const tempQuill = new Quill(document.createElement('div'));
    tempQuill.setContents(delta);
    return tempQuill.root.innerHTML;
  }
  splitContent(html, cols) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const blocks = Array.from(temp.children);
    if (blocks.length === 0) {
      const result = Array(cols).fill('<p><br></p>');
      result[0] = html || '<p><br></p>';
      return result;
    }
    const columns = Array(cols).fill('');
    if (blocks.length < cols) {
      columns[0] = blocks.map(b => b.outerHTML).join('');
      for (let i = 1; i < cols; i++) {
        columns[i] = '<p><br></p>';
      }
      return columns;
    }
    for (let i = 0; i < blocks.length; i++) {
      columns[i % cols] += blocks[i].outerHTML;
    }
    for (let i = 0; i < cols; i++) {
      if (!columns[i] || columns[i].trim() === '') {
        columns[i] = '<p><br></p>';
      }
    }
    return columns;
  }
  setupTabNavigation() {
    this.quill.root.addEventListener('keydown', this.onTabKey.bind(this), {
      capture: true
    });
  }
  onTabKey(e) {
    if (e.key !== 'Tab') return;
    const activeCol = this.getActiveColumn();
    if (!activeCol) return;
    e.preventDefault();
    const cols = this.getAllColumns();
    if (cols.length === 0) return;
    const currentIndex = Array.from(cols).indexOf(activeCol);
    const nextIndex = e.shiftKey ? (currentIndex - 1 + cols.length) % cols.length : (currentIndex + 1) % cols.length;
    this.focusColumn(cols[nextIndex]);
  }
  getActiveColumn() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.getRangeAt(0).commonAncestorContainer;
    while (node) {
      if (node instanceof HTMLElement && node.classList.contains('ql-layout-col')) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }
  getAllColumns() {
    return this.quill.root.querySelectorAll('.ql-layout-col');
  }
  focusColumn(col) {
    col.focus();
    const range = document.createRange();
    range.setStart(col, 0);
    range.collapse(true);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}