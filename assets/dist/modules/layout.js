function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
import LayoutBlot, { LayoutColumnBlot, applyRatios, isColumnEmpty, isHtmlEmpty, normalizeRatios, EMPTY_COLUMN_HTML } from "../blots/layout.js";
import { LayoutChrome } from "./layoutChrome.js";
import { LAYOUT_CHANGE_EVENT } from "./layoutEvents.js";
import { serializeHtml } from "../utils/serializeContent.js";
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
    label: '3 columns'
  }],
  allow_wrap: true,
  ui: true,
  show_badge: true
};
const ACTIVE_COLUMN_CLASS = 'ql-layout-col--active';
const EMPTY_COLUMN_CLASS = 'ql-layout-col--empty';
export class Layout {
  constructor(quill, userOptions) {
    if (userOptions === void 0) {
      userOptions = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.dropdownEl = null;
    this.chrome = null;
    this.activeColumnEl = null;
    this.selectionFrame = null;
    this.emptyFrame = null;
    this.onOutsideClick = () => {
      this.removeDropdown();
    };
    this.onSelectionChange = () => {
      if (this.selectionFrame !== null) return;
      this.selectionFrame = window.requestAnimationFrame(() => {
        this.selectionFrame = null;
        this.updateActiveColumn();
      });
    };
    this.quill = quill;
    this.options = _extends({}, DEFAULT_OPTIONS, userOptions);
    this.injectStyles();
    this.setupToolbarHandler();
    this.setupTabNavigation();
    this.setupActiveColumnTracking();
    this.setupEmptyColumnTracking();
    if (this.options.ui !== false) {
      this.chrome = new LayoutChrome(quill, this, {
        showBadge: this.options.show_badge !== false
      });
      this.chrome.mount();
    }
  }
  injectStyles() {
    const id = 'quill-layout-editor-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-editor .ql-layout {\n                position: relative;\n                border-radius: 4px;\n                transition: outline-color 0.15s ease;\n            }\n            .ql-editor .ql-layout:hover,\n            .ql-editor .ql-layout:focus-within {\n                outline: 1px solid rgba(74, 144, 217, 0.55);\n                outline-offset: 4px;\n            }\n            .ql-editor .ql-layout-col {\n                position: relative;\n                min-height: 48px;\n                padding: 8px;\n                border: 1px dashed #c0c0c0;\n                border-radius: 4px;\n                outline: none;\n                transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;\n            }\n            .ql-editor .ql-layout-col:hover {\n                background-color: rgba(74, 144, 217, 0.03);\n            }\n            .ql-editor .ql-layout-col--active {\n                border-color: #4a90d9;\n                border-style: solid;\n                box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);\n            }\n            .ql-editor .ql-layout-col--empty::before {\n                content: \"Empty column \u2014 click to write\";\n                position: absolute;\n                top: 8px;\n                left: 10px;\n                right: 10px;\n                color: #9aa0a6;\n                font-size: 13px;\n                font-style: italic;\n                pointer-events: none;\n            }\n            .ql-editor .ql-layout-col p:first-child {\n                margin-top: 0;\n            }\n            .ql-editor .ql-layout-col p:last-child {\n                margin-bottom: 0;\n            }\n            .ql-layout-picker {\n                position: fixed;\n                z-index: 1000;\n                background: #fff;\n                border: 1px solid #ccc;\n                border-radius: 4px;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                padding: 4px 0;\n                min-width: 140px;\n            }\n            .ql-layout-picker button {\n                display: block;\n                width: 100%;\n                padding: 6px 16px;\n                border: none;\n                background: none;\n                text-align: left;\n                cursor: pointer;\n                font-size: 14px;\n                line-height: 1.5;\n            }\n            .ql-layout-picker button:hover {\n                background: #e8f0fe;\n            }\n            .ql-layout-picker button:active {\n                background: #d2e3fc;\n            }\n            .ql-layout-chrome {\n                position: fixed;\n                z-index: 1002;\n                display: inline-flex;\n                align-items: center;\n                gap: 2px;\n                padding: 2px;\n                background: #fff;\n                border: 1px solid #d3d6da;\n                border-radius: 6px;\n                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n                font-size: 11px;\n                line-height: 1;\n                color: #444;\n            }\n            .ql-layout-chrome[hidden] {\n                display: none;\n            }\n            .ql-layout-chrome__badge {\n                padding: 0 6px;\n                color: #5f6368;\n                font-variant-numeric: tabular-nums;\n                white-space: nowrap;\n                border-right: 1px solid #e3e5e8;\n            }\n            .ql-layout-chrome__badge[hidden] {\n                display: none;\n            }\n            .ql-layout-chrome__btn {\n                display: inline-flex;\n                align-items: center;\n                justify-content: center;\n                min-width: 24px;\n                height: 24px;\n                padding: 0 4px;\n                border: none;\n                border-radius: 4px;\n                background: none;\n                color: #3c4043;\n                cursor: pointer;\n            }\n            .ql-layout-chrome__btn--presets {\n                gap: 3px;\n            }\n            .ql-layout-chrome__caret {\n                display: inline-flex;\n            }\n            .ql-layout-chrome__btn:hover:not(:disabled) {\n                background: #eef2f7;\n            }\n            .ql-layout-chrome__btn:active:not(:disabled) {\n                background: #e0e7f0;\n            }\n            .ql-layout-chrome__btn:focus-visible {\n                outline: 2px solid #4a90d9;\n                outline-offset: 1px;\n            }\n            .ql-layout-chrome__btn:disabled {\n                opacity: 0.35;\n                cursor: default;\n            }\n            .ql-layout-chrome__btn--danger {\n                color: #b3261e;\n            }\n            .ql-layout-chrome__confirm {\n                position: absolute;\n                top: calc(100% + 6px);\n                z-index: 1003;\n                right: 0;\n                width: 220px;\n                padding: 10px;\n                background: #fff;\n                border: 1px solid #d3d6da;\n                border-radius: 6px;\n                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n                font-size: 12px;\n                line-height: 1.4;\n                color: #3c4043;\n            }\n            .ql-layout-chrome__confirm[hidden] {\n                display: none;\n            }\n            .ql-layout-chrome__confirm-text {\n                margin: 0 0 8px;\n            }\n            .ql-layout-chrome__confirm-actions {\n                display: flex;\n                justify-content: flex-end;\n                gap: 6px;\n            }\n            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn {\n                min-width: auto;\n                height: 26px;\n                padding: 0 10px;\n                font-size: 12px;\n                border: 1px solid #d3d6da;\n            }\n            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn--danger {\n                border-color: transparent;\n                background: #b3261e;\n                color: #fff;\n            }\n            .ql-layout-chrome__confirm-actions .ql-layout-chrome__btn--danger:hover {\n                background: #8c1d17;\n            }\n            .ql-layout-menu {\n                position: fixed;\n                z-index: 1003;\n                min-width: 160px;\n                padding: 4px;\n                background: #fff;\n                border: 1px solid #d3d6da;\n                border-radius: 6px;\n                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n            }\n            .ql-layout-menu__item {\n                display: flex;\n                align-items: center;\n                gap: 8px;\n                width: 100%;\n                padding: 6px 8px;\n                border: none;\n                border-radius: 4px;\n                background: none;\n                cursor: pointer;\n                font-size: 12px;\n                color: #3c4043;\n                text-align: left;\n            }\n            .ql-layout-menu__item:hover,\n            .ql-layout-menu__item:focus-visible {\n                background: #eef2f7;\n                outline: none;\n            }\n            .ql-layout-menu__bars {\n                display: inline-flex;\n                gap: 2px;\n                width: 28px;\n                height: 12px;\n                flex: 0 0 auto;\n            }\n            .ql-layout-menu__bar {\n                background: #c6cbd1;\n                border-radius: 1px;\n            }\n            .ql-layout-visually-hidden {\n                position: absolute;\n                width: 1px;\n                height: 1px;\n                padding: 0;\n                margin: -1px;\n                overflow: hidden;\n                clip: rect(0 0 0 0);\n                white-space: nowrap;\n                border: 0;\n            }\n            @media (prefers-reduced-motion: reduce) {\n                .ql-editor .ql-layout,\n                .ql-editor .ql-layout-col {\n                    transition: none;\n                }\n            }\n            @media print {\n                .ql-layout-chrome,\n                .ql-layout-chrome__confirm,\n                .ql-layout-menu,\n                .ql-layout-picker {\n                    display: none !important;\n                }\n                .ql-editor .ql-layout-col--empty::before {\n                    content: none !important;\n                }\n                .ql-editor .ql-layout {\n                    outline: none !important;\n                }\n            }\n        ";
    document.head.appendChild(style);
  }
  setupToolbarHandler() {
    var _toolbar$container;
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar) return;
    const button = (_toolbar$container = toolbar.container) == null ? void 0 : _toolbar$container.querySelector('button.ql-layout');
    button == null || button.setAttribute('title', 'Layout');
    button == null || button.setAttribute('aria-label', 'Layout');
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
      columns: Array(preset.cols).fill(EMPTY_COLUMN_HTML)
    };
    this.quill.insertEmbed(index, 'layout', value, 'user');
    this.markEmptyColumns();
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
    this.markEmptyColumns();
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
      const result = Array(cols).fill(EMPTY_COLUMN_HTML);
      result[0] = html || EMPTY_COLUMN_HTML;
      return result;
    }
    const columns = Array(cols).fill('');
    if (blocks.length < cols) {
      columns[0] = blocks.map(b => b.outerHTML).join('');
      for (let i = 1; i < cols; i++) {
        columns[i] = EMPTY_COLUMN_HTML;
      }
      return columns;
    }
    for (let i = 0; i < blocks.length; i++) {
      columns[i % cols] += blocks[i].outerHTML;
    }
    for (let i = 0; i < cols; i++) {
      if (!columns[i] || columns[i].trim() === '') {
        columns[i] = EMPTY_COLUMN_HTML;
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
    const activeCol = this.getActiveColumnElement();
    if (!activeCol) return;
    e.preventDefault();
    const cols = this.getAllColumns();
    if (cols.length === 0) return;
    const currentIndex = Array.from(cols).indexOf(activeCol);
    const nextIndex = e.shiftKey ? (currentIndex - 1 + cols.length) % cols.length : (currentIndex + 1) % cols.length;
    this.focusColumn(cols[nextIndex]);
  }
  setupActiveColumnTracking() {
    document.addEventListener('selectionchange', this.onSelectionChange);
  }
  updateActiveColumn() {
    var _this$chrome;
    const column = this.getActiveColumnElement();
    if (column !== this.activeColumnEl) {
      var _this$activeColumnEl;
      (_this$activeColumnEl = this.activeColumnEl) == null || _this$activeColumnEl.classList.remove(ACTIVE_COLUMN_CLASS);
      this.activeColumnEl = column;
      column == null || column.classList.add(ACTIVE_COLUMN_CLASS);
    }
    (_this$chrome = this.chrome) == null || _this$chrome.handleActiveColumnChange(column);
  }
  setupEmptyColumnTracking() {
    this.markEmptyColumns();
    if (typeof this.quill.on !== 'function') return;
    this.quill.on('text-change', () => this.scheduleEmptyMark());
  }
  scheduleEmptyMark() {
    if (this.emptyFrame !== null) return;
    this.emptyFrame = window.requestAnimationFrame(() => {
      this.emptyFrame = null;
      this.markEmptyColumns();
    });
  }
  markEmptyColumns() {
    const root = this.quill.root;
    root.querySelectorAll('.ql-layout-col').forEach(column => {
      column.classList.toggle(EMPTY_COLUMN_CLASS, isColumnEmpty(column));
    });
  }
  getActiveColumnElement() {
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
    if (!col) return;
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

  // ---------------------------------------------------------------------
  // Public API — used by the layout chrome
  // ---------------------------------------------------------------------

  getPresets() {
    return this.options.presets;
  }
  findLayout(target) {
    var _ref;
    if (!target) return null;
    const element = target instanceof Element ? target : target.parentElement;
    return (_ref = element == null ? void 0 : element.closest('.ql-layout')) != null ? _ref : null;
  }
  getLayoutValue(layoutNode) {
    return LayoutBlot.value(layoutNode);
  }
  getColumnElements(layoutNode) {
    return Array.from(layoutNode.querySelectorAll('.ql-layout-col'));
  }
  getActiveColumnIndex(layoutNode) {
    const column = this.getActiveColumnElement();
    if (!column || !layoutNode.contains(column)) return -1;
    return this.getColumnElements(layoutNode).indexOf(column);
  }
  isColumnEmpty(column) {
    return isColumnEmpty(column);
  }

  /**
   * Changes the column ratios without touching the column contents.
   * Returns the (unchanged) layout node.
   */
  applyPreset(layoutNode, preset) {
    const current = LayoutBlot.value(layoutNode);
    if (preset.cols === current.cols) {
      var _this$chrome2;
      applyRatios(layoutNode, preset.ratios);
      this.markEmptyColumns();
      this.emitLayoutChange(layoutNode);
      (_this$chrome2 = this.chrome) == null || _this$chrome2.refresh();
      return layoutNode;
    }
    const columns = this.reshapeColumns(current.columns, preset.cols);
    const value = {
      cols: preset.cols,
      ratios: preset.ratios,
      columns
    };
    const activeIndex = this.getActiveColumnIndex(layoutNode);
    const focusIndex = activeIndex >= 0 ? Math.min(activeIndex, preset.cols - 1) : 0;
    return this.replaceLayout(layoutNode, value, focusIndex);
  }
  addColumn(layoutNode, afterIndex) {
    const current = LayoutBlot.value(layoutNode);
    const anchor = typeof afterIndex === 'number' ? afterIndex : current.cols - 1;
    const insertAt = Math.min(Math.max(anchor, -1), current.cols - 1) + 1;
    const columns = [...current.columns];
    columns.splice(insertAt, 0, EMPTY_COLUMN_HTML);
    const ratios = [...current.ratios];
    ratios.splice(Math.min(insertAt, ratios.length), 0, '1fr');
    return this.replaceLayout(layoutNode, {
      cols: columns.length,
      ratios: this.ensureRatioCount(ratios, columns.length),
      columns
    }, insertAt);
  }
  removeColumn(layoutNode, index) {
    const current = LayoutBlot.value(layoutNode);
    if (current.cols <= 2 || index < 0 || index >= current.cols) return layoutNode;
    const columns = [...current.columns];
    const removed = columns.splice(index, 1)[0];
    const targetIndex = index > 0 ? index - 1 : 0;
    if (!isHtmlEmpty(removed)) {
      columns[targetIndex] = index === 0 ? removed + columns[targetIndex] : columns[targetIndex] + removed;
    }
    const ratios = [...current.ratios];
    ratios.splice(index, 1);
    return this.replaceLayout(layoutNode, {
      cols: columns.length,
      ratios: this.ensureRatioCount(ratios, columns.length),
      columns
    }, targetIndex);
  }
  duplicateLayout(layoutNode) {
    var _this$quill$root$quer;
    const value = LayoutBlot.value(layoutNode);
    const layouts = Array.from(this.quill.root.querySelectorAll('.ql-layout'));
    const ordinal = layouts.indexOf(layoutNode);
    const copy = LayoutBlot.create(value);
    layoutNode.after(copy);
    this.rebuildEditor();
    const rebuilt = (_this$quill$root$quer = this.quill.root.querySelectorAll('.ql-layout')[ordinal + 1]) != null ? _this$quill$root$quer : null;
    this.markEmptyColumns();
    this.emitLayoutChange(rebuilt);
    if (rebuilt) {
      var _this$getColumnElemen;
      this.focusColumn((_this$getColumnElemen = this.getColumnElements(rebuilt)[0]) != null ? _this$getColumnElemen : null);
    }
    return rebuilt;
  }
  unwrapLayout(layoutNode) {
    const value = LayoutBlot.value(layoutNode);
    const holder = document.createElement('div');
    holder.innerHTML = value.columns.join('');
    const fragment = document.createDocumentFragment();
    Array.from(holder.childNodes).forEach(child => fragment.appendChild(child));
    layoutNode.replaceWith(fragment);
    this.rebuildEditor();
    this.markEmptyColumns();
    this.emitLayoutChange(null);
    return null;
  }
  reshapeColumns(columns, targetCols) {
    const next = columns.slice(0, Math.max(targetCols, 0));
    while (next.length < targetCols) {
      next.push(EMPTY_COLUMN_HTML);
    }
    if (columns.length > targetCols) {
      const overflow = columns.slice(targetCols).filter(html => !isHtmlEmpty(html));
      if (overflow.length > 0 && next.length > 0) {
        const last = next.length - 1;
        next[last] = next[last] + overflow.join('');
      }
    }
    return next.map(html => isHtmlEmpty(html) ? EMPTY_COLUMN_HTML : html);
  }
  ensureRatioCount(ratios, count) {
    const next = ratios.slice(0, count);
    while (next.length < count) {
      next.push('1fr');
    }
    return next.every(ratio => /^\d*\.?\d+fr$/.test(ratio)) ? next : normalizeRatios(count);
  }
  replaceLayout(layoutNode, value, focusIndex) {
    var _this$quill$root$quer2;
    const layouts = Array.from(this.quill.root.querySelectorAll('.ql-layout'));
    const ordinal = Math.max(0, layouts.indexOf(layoutNode));
    const replacement = LayoutBlot.create(value);
    layoutNode.replaceWith(replacement);
    this.rebuildEditor();
    const rebuilt = (_this$quill$root$quer2 = this.quill.root.querySelectorAll('.ql-layout')[ordinal]) != null ? _this$quill$root$quer2 : null;
    this.markEmptyColumns();
    this.emitLayoutChange(rebuilt);
    if (rebuilt) {
      var _this$getColumnElemen2;
      this.focusColumn((_this$getColumnElemen2 = this.getColumnElements(rebuilt)[focusIndex]) != null ? _this$getColumnElemen2 : null);
    }
    return rebuilt;
  }
  rebuildEditor() {
    const root = this.quill.root;
    root.innerHTML = serializeHtml(root.innerHTML);
    const scroll = this.quill.scroll;
    if (typeof (scroll == null ? void 0 : scroll.build) === 'function') {
      scroll.build();
      scroll.optimize == null || scroll.optimize();
    }
  }
  emitLayoutChange(layoutNode) {
    const emitter = this.quill.emitter;
    if (typeof (emitter == null ? void 0 : emitter.emit) !== 'function') return;
    emitter.emit(LAYOUT_CHANGE_EVENT, {
      node: layoutNode,
      value: layoutNode ? LayoutBlot.value(layoutNode) : null
    });
  }
  destroy() {
    var _this$chrome3;
    document.removeEventListener('selectionchange', this.onSelectionChange);
    (_this$chrome3 = this.chrome) == null || _this$chrome3.destroy();
    this.chrome = null;
    if (this.selectionFrame !== null) {
      window.cancelAnimationFrame(this.selectionFrame);
      this.selectionFrame = null;
    }
    if (this.emptyFrame !== null) {
      window.cancelAnimationFrame(this.emptyFrame);
      this.emptyFrame = null;
    }
  }
}