import Quill from 'quill';
import CalloutBlot from "../blots/callout.js";
Quill.register(CalloutBlot);
const LABELS = {
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  success: 'Success'
};
export class Callout {
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.picker = null;
    this.quill = quill;
    this.options = options;
    this.options.types = this.options.types || ['info', 'warning', 'danger', 'success'];
    this.options.defaultType = this.options.defaultType || 'info';
    this.options.labels = this.options.labels || LABELS;
    this.injectStyles();
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('callout', () => this.togglePicker());
    }
    document.addEventListener('click', e => {
      var _toolbar$container;
      const toolbar = this.quill.getModule('toolbar');
      const inToolbar = toolbar == null || (_toolbar$container = toolbar.container) == null ? void 0 : _toolbar$container.contains(e.target);
      if (this.picker && !this.picker.contains(e.target) && !inToolbar) {
        this.hidePicker();
      }
    });
  }
  togglePicker() {
    if (this.picker) {
      this.hidePicker();
      return;
    }
    this.showPicker();
  }
  showPicker() {
    const toolbar = this.quill.getModule('toolbar');
    if (!(toolbar != null && toolbar.container)) return;
    const btn = toolbar.container.querySelector('button.ql-callout');
    if (!btn) return;
    this.picker = document.createElement('div');
    this.picker.className = 'ql-callout-picker';
    const types = this.options.types;
    const labels = this.options.labels;
    types.forEach(type => {
      const item = document.createElement('div');
      item.className = "ql-callout-picker-item ql-callout-picker-item--" + type;
      item.textContent = labels[type] || type;
      item.addEventListener('click', e => {
        e.stopPropagation();
        this.insert(type);
        this.hidePicker();
      });
      this.picker.appendChild(item);
    });
    const rect = btn.getBoundingClientRect();
    this.picker.style.position = 'fixed';
    this.picker.style.top = rect.bottom + 4 + "px";
    this.picker.style.left = rect.left + "px";
    this.picker.style.minWidth = rect.width + "px";
    this.picker.style.zIndex = '9999';
    document.body.appendChild(this.picker);
  }
  hidePicker() {
    if (this.picker) {
      this.picker.remove();
      this.picker = null;
    }
  }
  insert(type) {
    const range = this.quill.getSelection(true);
    if (!range) return;
    const t = type || this.options.defaultType;
    this.quill.insertEmbed(range.index, 'callout', {
      type: t
    }, 'user');
    this.quill.setSelection(range.index + 1, 'api');
  }
  injectStyles() {
    const id = 'ql-callout-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-callout {\n                position: relative;\n                box-sizing: border-box;\n            }\n            .ql-callout--info {\n                border-left: 4px solid #1a73e8;\n                background-color: #e8f0fe;\n            }\n            .ql-callout--warning {\n                border-left: 4px solid #e37400;\n                background-color: #fef7e0;\n            }\n            .ql-callout--danger {\n                border-left: 4px solid #d93025;\n                background-color: #fce8e6;\n            }\n            .ql-callout--success {\n                border-left: 4px solid #188038;\n                background-color: #e6f4ea;\n            }\n            .ql-callout-header {\n                display: flex;\n                align-items: center;\n                gap: 8px;\n                padding: 10px 14px 0;\n                font-weight: 600;\n                font-size: 13px;\n                text-transform: uppercase;\n                letter-spacing: 0.5px;\n                user-select: none;\n                cursor: default;\n            }\n            .ql-callout--info .ql-callout-header { color: #1a73e8; }\n            .ql-callout--warning .ql-callout-header { color: #e37400; }\n            .ql-callout--danger .ql-callout-header { color: #d93025; }\n            .ql-callout--success .ql-callout-header { color: #188038; }\n            .ql-callout-icon {\n                font-size: 16px;\n                line-height: 1;\n            }\n            .ql-callout-content {\n                padding: 8px 14px 12px;\n                min-height: 1em;\n            }\n            .ql-callout-content p { margin: 0; }\n            .ql-callout-content p + p { margin-top: 8px; }\n            .ql-callout-picker {\n                background: #fff;\n                border: 1px solid #ccc;\n                border-radius: 6px;\n                box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n                overflow: hidden;\n            }\n            .ql-callout-picker-item {\n                padding: 8px 16px;\n                cursor: pointer;\n                font-size: 14px;\n                white-space: nowrap;\n                transition: background 0.15s;\n            }\n            .ql-callout-picker-item:hover { background: #f0f0f0; }\n            .ql-callout-picker-item--info { border-left: 3px solid #1a73e8; }\n            .ql-callout-picker-item--warning { border-left: 3px solid #e37400; }\n            .ql-callout-picker-item--danger { border-left: 3px solid #d93025; }\n            .ql-callout-picker-item--success { border-left: 3px solid #188038; }\n        ";
    document.head.appendChild(style);
  }
}