function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
export class Autosave {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.storageKey = void 0;
    this.saveTimeout = null;
    this.quill = quill;
    this.options = _extends({
      interval: 2000,
      restore_type: 'manual',
      key_suffix: null,
      notificationText: 'An unsaved version of your text was found.',
      restoreButtonLabel: 'Restore',
      ignoreButtonLabel: 'Ignore'
    }, options);

    // Use the ID of the container which now has a unique ID from the Twig template
    // We also use the current pathname to avoid collisions between different pages with same field IDs
    const id = this.quill.container.id || 'default';
    const path = window.location.pathname.replace(/[^a-z0-9]/gi, '_');
    this.storageKey = "quill_autosave_" + path + "_" + id + (this.options.key_suffix ? "_" + this.options.key_suffix : '');
    this.injectStyles();

    // Wait a small bit to let the Stimulus controller load initial data from the hidden input
    setTimeout(() => this.init(), 500);
  }
  init() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      try {
        var _currentContents$ops;
        const savedDelta = JSON.parse(savedData);
        const currentContents = this.quill.getContents();

        // Compare Deltas instead of HTML
        if (JSON.stringify(savedDelta) === JSON.stringify(currentContents)) {
          this.clear();
          return;
        }

        // Check if current editor is effectively empty
        const currentText = this.quill.getText().trim();
        const isCurrentEmpty = currentText === '' && ((_currentContents$ops = currentContents.ops) == null ? void 0 : _currentContents$ops.length) <= 1;
        if (this.options.restore_type === 'auto' && isCurrentEmpty) {
          this.restore(savedDelta);
        } else {
          this.showRestoreNotification(savedDelta);
        }
      } catch (e) {
        // If parsing fails, it's probably old HTML data, clear it
        this.clear();
      }
    }
    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source !== 'user') return;
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.save(), this.options.interval);
    });
    const form = this.quill.container.closest('form');
    if (form) {
      form.addEventListener('submit', () => this.clear());
    }

    // Listen for global clear event
    window.addEventListener('quill:autosave:clear', event => {
      var _event$detail;
      if (!((_event$detail = event.detail) != null && _event$detail.id) || event.detail.id === this.quill.container.id) {
        var _document$getElementB;
        this.clear();
        const id = "quill-autosave-notification-" + this.quill.container.id;
        (_document$getElementB = document.getElementById(id)) == null || _document$getElementB.remove();
      }
    });
  }
  save() {
    var _contents$ops;
    const contents = this.quill.getContents();
    const text = this.quill.getText().trim();
    if (text === '' && ((_contents$ops = contents.ops) == null ? void 0 : _contents$ops.length) <= 1) {
      this.clear();
      return;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(contents));
  }
  restore(contents) {
    this.quill.setContents(contents, 'api');
    // Important: tell Quill that content has changed to trigger Stimulus sync
    this.quill.update();
  }
  clear() {
    localStorage.removeItem(this.storageKey);
  }
  showRestoreNotification(savedDelta) {
    var _notification$querySe, _notification$querySe2;
    const id = "quill-autosave-notification-" + this.quill.container.id;
    if (document.getElementById(id)) return;
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = 'ql-autosave-notification';
    notification.innerHTML = "\n            <span>" + this.options.notificationText + "</span>\n            <div class=\"ql-autosave-actions\">\n                <button type=\"button\" class=\"ql-restore-btn\">" + this.options.restoreButtonLabel + "</button>\n                <button type=\"button\" class=\"ql-ignore-btn\">" + this.options.ignoreButtonLabel + "</button>\n            </div>\n        ";

    // Insert before the editor container
    const container = this.quill.container.parentElement;
    if (container) {
      container.insertBefore(notification, this.quill.container);
    }
    (_notification$querySe = notification.querySelector('.ql-restore-btn')) == null || _notification$querySe.addEventListener('click', () => {
      this.restore(savedDelta);
      notification.remove();
    });
    (_notification$querySe2 = notification.querySelector('.ql-ignore-btn')) == null || _notification$querySe2.addEventListener('click', () => {
      this.clear();
      notification.remove();
    });
  }
  injectStyles() {
    const id = 'quill-autosave-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = "\n            .ql-autosave-notification {\n                background: #fff3cd;\n                border: 1px solid #ffeeba;\n                color: #856404;\n                padding: 10px 15px;\n                margin-bottom: 10px;\n                border-radius: 4px;\n                display: flex;\n                align-items: center;\n                justify-content: space-between;\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n                font-size: 13px;\n                z-index: 10;\n            }\n            .ql-autosave-actions {\n                display: flex;\n                gap: 10px;\n            }\n            .ql-autosave-actions button {\n                padding: 5px 12px;\n                border-radius: 4px;\n                cursor: pointer;\n                font-size: 12px;\n                font-weight: 600;\n                border: 1px solid transparent;\n                transition: all 0.2s;\n            }\n            .ql-restore-btn {\n                background: #856404;\n                color: #fff;\n            }\n            .ql-restore-btn:hover {\n                background: #6d5003;\n            }\n            .ql-ignore-btn {\n                background: transparent;\n                border-color: #856404 !important;\n                color: #856404;\n            }\n            .ql-ignore-btn:hover {\n                background: #fff8e1;\n            }\n        ";
    document.head.appendChild(style);
  }
}