function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
export class LinkAttributes {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.tooltip = null;
    this.currentLink = null;
    this.editButton = null;
    this.quill = quill;
    this.options = _extends({
      openInNewTabLabel: 'Open in new tab',
      noFollowLabel: 'No follow (SEO)',
      saveButtonLabel: 'OK'
    }, options);
    this.injectStyles();
    this.quill.root.addEventListener('click', ev => {
      const target = ev.target;
      const anchor = target.closest('a');
      if (anchor && this.quill.root.contains(anchor)) {
        this.showEditButton(anchor);
      } else if (this.tooltip && !this.tooltip.contains(target) && target !== this.editButton) {
        this.hideAll();
      }
    });
    this.quill.root.addEventListener('scroll', () => this.hideAll());
    this.quill.on('selection-change', range => {
      if (range) this.hideAll();
    });
  }
  showEditButton(anchor) {
    this.currentLink = anchor;
    this.hideTooltip();
    if (!this.editButton) {
      this.editButton = document.createElement('div');
      this.editButton.className = 'ql-link-edit-button';
      this.editButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
      this.editButton.addEventListener('click', ev => {
        ev.stopPropagation();
        this.showTooltip();
      });
      this.quill.container.appendChild(this.editButton);
    }
    this.positionElement(anchor, this.editButton, 'button');
    this.editButton.style.display = 'flex';
  }
  showTooltip() {
    if (!this.currentLink) return;
    if (!this.tooltip) {
      var _this$tooltip$querySe;
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'ql-link-attribute-tooltip';
      this.tooltip.innerHTML = "\n                <div class=\"ql-link-attribute-row\">\n                    <label><input type=\"checkbox\" class=\"ql-link-target-input\"> " + this.options.openInNewTabLabel + "</label>\n                </div>\n                <div class=\"ql-link-attribute-row\">\n                    <label><input type=\"checkbox\" class=\"ql-link-rel-input\"> " + this.options.noFollowLabel + "</label>\n                </div>\n                <div class=\"ql-link-attribute-actions\">\n                    <button type=\"button\" class=\"ql-link-attribute-save\">" + this.options.saveButtonLabel + "</button>\n                </div>\n            ";
      (_this$tooltip$querySe = this.tooltip.querySelector('.ql-link-attribute-save')) == null || _this$tooltip$querySe.addEventListener('click', () => this.hideAll());
      const targetInput = this.tooltip.querySelector('.ql-link-target-input');
      const relInput = this.tooltip.querySelector('.ql-link-rel-input');
      targetInput.addEventListener('change', () => {
        if (this.currentLink) {
          const blot = Quill.find(this.currentLink);
          if (blot) {
            // @ts-ignore
            blot.format('target', targetInput.checked ? '_blank' : null);
          }
        }
      });
      relInput.addEventListener('change', () => {
        if (this.currentLink) {
          const blot = Quill.find(this.currentLink);
          if (blot) {
            // @ts-ignore
            blot.format('rel', relInput.checked ? 'nofollow' : null);
          }
        }
      });
      this.quill.container.appendChild(this.tooltip);
    }
    const targetInput = this.tooltip.querySelector('.ql-link-target-input');
    const relInput = this.tooltip.querySelector('.ql-link-rel-input');
    targetInput.checked = this.currentLink.getAttribute('target') === '_blank';
    relInput.checked = this.currentLink.getAttribute('rel') === 'nofollow';
    this.positionElement(this.currentLink, this.tooltip, 'tooltip');
    this.tooltip.style.display = 'block';
    if (this.editButton) this.editButton.style.display = 'none';
  }
  positionElement(anchor, element, type) {
    const rect = anchor.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
    if (type === 'button') {
      element.style.top = top - 30 + "px";
      element.style.left = left + rect.width / 2 - 13 + "px";
    } else {
      element.style.top = top + rect.height + 5 + "px";
      element.style.left = left + "px";
    }
  }
  hideTooltip() {
    if (this.tooltip) this.tooltip.style.display = 'none';
  }
  hideAll() {
    this.hideTooltip();
    if (this.editButton) this.editButton.style.display = 'none';
    this.currentLink = null;
  }
  injectStyles() {
    const id = 'quill-link-attributes-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-link-edit-button {\n                position: absolute;\n                background: #fff;\n                border: 1px solid #ccc;\n                border-radius: 4px;\n                width: 26px;\n                height: 26px;\n                display: none;\n                align-items: center;\n                justify-content: center;\n                cursor: pointer;\n                box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n                z-index: 1000;\n                color: #444;\n            }\n            .ql-link-edit-button:hover {\n                background: #f0f0f0;\n                color: #06c;\n            }\n            .ql-link-attribute-tooltip {\n                position: absolute;\n                background: #fff;\n                border: 1px solid #ccc;\n                box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n                padding: 10px;\n                border-radius: 4px;\n                z-index: 1001;\n                display: none;\n                min-width: 150px;\n                font-family: sans-serif;\n            }\n            .ql-link-attribute-row {\n                margin-bottom: 5px;\n            }\n            .ql-link-attribute-row label {\n                display: flex;\n                align-items: center;\n                font-size: 13px;\n                color: #444;\n                cursor: pointer;\n            }\n            .ql-link-attribute-row input {\n                margin-right: 8px;\n            }\n            .ql-link-attribute-actions {\n                text-align: right;\n                margin-top: 8px;\n            }\n            .ql-link-attribute-save {\n                background: #06c;\n                color: #fff;\n                border: none;\n                padding: 3px 10px;\n                border-radius: 3px;\n                cursor: pointer;\n                font-size: 12px;\n            }\n        ";
    document.head.appendChild(style);
  }
}