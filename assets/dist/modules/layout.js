function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
import LayoutBlot from "../blots/layout.js";
Quill.register(LayoutBlot);
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
const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'FIGURE', 'HR', 'PRE', 'DIV'];
export class Layout {
  constructor(quill, userOptions) {
    if (userOptions === void 0) {
      userOptions = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.dropdownEl = null;
    this.observers = [];
    this.onOutsideClick = () => {
      this.removeDropdown();
    };
    this.quill = quill;
    this.options = _extends({}, DEFAULT_OPTIONS, userOptions);
    this.injectStyles();
    this.setupToolbarHandler();
    this.setupKeyboardNav();
  }
  injectStyles() {
    const id = 'quill-layout-editor-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-editor .ql-layout {\n                position: relative;\n            }\n            .ql-editor .ql-layout-col {\n                min-height: 48px;\n                padding: 8px;\n                border: 1px dashed #c0c0c0;\n                border-radius: 4px;\n                outline: none;\n                transition: border-color 0.15s, box-shadow 0.15s;\n            }\n            .ql-editor .ql-layout-col:focus {\n                border-color: #4a90d9;\n                border-style: solid;\n                box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);\n            }\n            .ql-editor .ql-layout-col p:first-child {\n                margin-top: 0;\n            }\n            .ql-editor .ql-layout-col p:last-child {\n                margin-bottom: 0;\n            }\n            .ql-layout-picker {\n                position: fixed;\n                z-index: 1000;\n                background: #fff;\n                border: 1px solid #ccc;\n                border-radius: 4px;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                padding: 4px 0;\n                min-width: 140px;\n            }\n            .ql-layout-picker button {\n                display: block;\n                width: 100%;\n                padding: 6px 16px;\n                border: none;\n                background: none;\n                text-align: left;\n                cursor: pointer;\n                font-size: 14px;\n                line-height: 1.5;\n            }\n            .ql-layout-picker button:hover {\n                background: #e8f0fe;\n            }\n            .ql-layout-picker button:active {\n                background: #d2e3fc;\n            }\n        ";
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
    const hasSelection = range.length > 0;
    if (hasSelection && this.options.allow_wrap) {
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

    // Position the dropdown below the toolbar button
    if (referenceEl) {
      const rect = referenceEl.getBoundingClientRect();
      dropdown.style.top = rect.bottom + 4 + "px";
      dropdown.style.left = rect.left + "px";
    } else {
      dropdown.style.top = '40px';
      dropdown.style.left = '0';
    }

    // Close on click outside
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
    this.quill.setSelection(index + 1, 'api');
    this.setupColumnSync();
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
    this.quill.setSelection(range.index + 1, 'api');
    this.setupColumnSync();
  }
  convertDeltaToHtml(delta) {
    const tempQuill = new Quill(document.createElement('div'));
    tempQuill.setContents(delta);
    return tempQuill.root.innerHTML;
  }
  splitContent(html, cols) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const blocks = [];
    for (const child of temp.children) {
      if (BLOCK_TAGS.includes(child.tagName)) {
        blocks.push(child);
      }
    }
    if (blocks.length === 0) {
      const result = Array(cols).fill('<p><br></p>');
      result[0] = html || '<p><br></p>';
      return result;
    }

    // Round-robin distribution
    const columns = Array(cols).fill('');

    // If fewer blocks than columns, put all in column 0
    if (blocks.length < cols) {
      columns[0] = blocks.map(b => b.outerHTML).join('');
      for (let i = 1; i < cols; i++) {
        columns[i] = '<p><br></p>';
      }
      return columns;
    }
    for (let i = 0; i < blocks.length; i++) {
      const colIdx = i % cols;
      columns[colIdx] += blocks[i].outerHTML;
    }

    // Ensure each column has at least a paragraph
    for (let i = 0; i < cols; i++) {
      if (!columns[i] || columns[i].trim() === '') {
        columns[i] = '<p><br></p>';
      }
    }
    return columns;
  }
  setupKeyboardNav() {
    this.quill.root.addEventListener('keydown', this.onKeyDown.bind(this), {
      capture: true
    });
  }
  onKeyDown(e) {
    const activeCol = this.getActiveColumn();
    if (!activeCol) return;
    const cols = this.getAllColumns();
    if (cols.length === 0) return;
    const currentIndex = Array.from(cols).indexOf(activeCol);
    switch (e.key) {
      case 'Tab':
        {
          e.preventDefault();
          const nextIndex = e.shiftKey ? (currentIndex - 1 + cols.length) % cols.length : (currentIndex + 1) % cols.length;
          this.focusColumn(cols[nextIndex]);
          break;
        }
      case 'ArrowUp':
        {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const isAtStart = range.startOffset === 0 && range.collapsed;
            if (isAtStart && currentIndex > 0) {
              e.preventDefault();
              this.focusColumnEnd(cols[currentIndex - 1]);
            }
          }
          break;
        }
      case 'ArrowDown':
        {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const isAtEnd = this.isAtEndOfColumn(activeCol, range);
            if (isAtEnd && currentIndex < cols.length - 1) {
              e.preventDefault();
              this.focusColumnStart(cols[currentIndex + 1]);
            }
          }
          break;
        }
      case 'Enter':
        {
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            this.insertLineBreak();
          } else {
            this.insertNewParagraph();
          }
          break;
        }
    }
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
  focusColumnEnd(col) {
    col.focus();
    const range = document.createRange();
    range.selectNodeContents(col);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  focusColumnStart(col) {
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
  isAtEndOfColumn(col, range) {
    var _col$textContent;
    const lastChild = col.lastChild;
    if (!lastChild) return true;
    const colLength = ((_col$textContent = col.textContent) == null ? void 0 : _col$textContent.length) || 0;
    return range.startOffset >= colLength - 1 || range.startContainer === lastChild;
  }
  insertLineBreak() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const br = document.createElement('br');
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  insertNewParagraph() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);

    // Find the current block (closest <p> or the column itself)
    let block = range.commonAncestorContainer;
    while (block && block.nodeType === Node.TEXT_NODE) {
      block = block.parentNode;
    }
    while (block && block instanceof HTMLElement && block.tagName !== 'P' && block.tagName !== 'DIV') {
      if (block.classList.contains('ql-layout-col')) break;
      block = block.parentNode;
    }
    if (!block || !(block instanceof HTMLElement)) {
      // Fallback: just insert a <br>
      this.insertLineBreak();
      return;
    }

    // Split text node at cursor if needed
    if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
      const textNode = range.startContainer;
      const splitText = textNode.splitText(range.startOffset);
      range.setStart(splitText, 0);
      range.collapse(true);
    }
    const newP = document.createElement('p');
    const br = document.createElement('br');
    newP.appendChild(br);
    if (block.parentNode) {
      block.parentNode.insertBefore(newP, block.nextSibling);
    }

    // Move cursor to new paragraph
    const newRange = document.createRange();
    newRange.setStart(newP, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
  setupColumnSync() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
    const layouts = this.quill.root.querySelectorAll('.ql-layout');
    layouts.forEach(layout => {
      const cols = layout.querySelectorAll('.ql-layout-col');
      cols.forEach(col => {
        const observer = new MutationObserver(this.debounce(() => this.syncLayoutContent(), 100));
        observer.observe(col, {
          childList: true,
          subtree: true,
          characterData: true
        });
        this.observers.push(observer);
      });
    });
  }
  debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }
  syncLayoutContent() {
    const root = this.quill.root;
    const container = root.closest('[data-controller]');
    if (!container) return;
    const input = container.querySelector('[data-ehyiah--ux-quill--quill-target="input"]');
    if (!input) return;
    input.value = root.innerHTML;
    input.dispatchEvent(new Event('input', {
      bubbles: true
    }));
    input.dispatchEvent(new Event('change', {
      bubbles: true
    }));
  }
  refreshSync() {
    this.setupColumnSync();
  }
}