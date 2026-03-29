export class Autosave {
  quill;
  options;
  storageKey;
  saveTimeout = null;
  constructor(quill, options) {
    this.quill = quill;
    this.options = {
      interval: 2000,
      restore_type: 'manual',
      key_suffix: null,
      notificationText: 'An unsaved version of your text was found.',
      restoreButtonLabel: 'Restore',
      ignoreButtonLabel: 'Ignore',
      ...options
    };

    // Use the ID of the container which now has a unique ID from the Twig template
    // We also use the current pathname to avoid collisions between different pages with same field IDs
    const id = this.quill.container.id || 'default';
    const path = window.location.pathname.replace(/[^a-z0-9]/gi, '_');
    this.storageKey = `quill_autosave_${path}_${id}${this.options.key_suffix ? `_${this.options.key_suffix}` : ''}`;
    this.injectStyles();

    // Wait a small bit to let the Stimulus controller load initial data from the hidden input
    setTimeout(() => this.init(), 500);
  }
  init() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      try {
        const savedDelta = JSON.parse(savedData);
        const currentContents = this.quill.getContents();

        // Compare Deltas instead of HTML
        if (JSON.stringify(savedDelta) === JSON.stringify(currentContents)) {
          this.clear();
          return;
        }

        // Check if current editor is effectively empty
        const currentText = this.quill.getText().trim();
        const isCurrentEmpty = currentText === '' && currentContents.ops?.length <= 1;
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
      if (!event.detail?.id || event.detail.id === this.quill.container.id) {
        this.clear();
        const id = `quill-autosave-notification-${this.quill.container.id}`;
        document.getElementById(id)?.remove();
      }
    });
  }
  save() {
    const contents = this.quill.getContents();
    const text = this.quill.getText().trim();
    if (text === '' && contents.ops?.length <= 1) {
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
    const id = `quill-autosave-notification-${this.quill.container.id}`;
    if (document.getElementById(id)) return;
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = 'ql-autosave-notification';
    notification.innerHTML = `
            <span>${this.options.notificationText}</span>
            <div class="ql-autosave-actions">
                <button type="button" class="ql-restore-btn">${this.options.restoreButtonLabel}</button>
                <button type="button" class="ql-ignore-btn">${this.options.ignoreButtonLabel}</button>
            </div>
        `;

    // Insert before the editor container
    const container = this.quill.container.parentElement;
    if (container) {
      container.insertBefore(notification, this.quill.container);
    }
    notification.querySelector('.ql-restore-btn')?.addEventListener('click', () => {
      this.restore(savedDelta);
      notification.remove();
    });
    notification.querySelector('.ql-ignore-btn')?.addEventListener('click', () => {
      this.clear();
      notification.remove();
    });
  }
  injectStyles() {
    const id = 'quill-autosave-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
            .ql-autosave-notification {
                background: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
                padding: 10px 15px;
                margin-bottom: 10px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 13px;
                z-index: 10;
            }
            .ql-autosave-actions {
                display: flex;
                gap: 10px;
            }
            .ql-autosave-actions button {
                padding: 5px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid transparent;
                transition: all 0.2s;
            }
            .ql-restore-btn {
                background: #856404;
                color: #fff;
            }
            .ql-restore-btn:hover {
                background: #6d5003;
            }
            .ql-ignore-btn {
                background: transparent;
                border-color: #856404 !important;
                color: #856404;
            }
            .ql-ignore-btn:hover {
                background: #fff8e1;
            }
        `;
    document.head.appendChild(style);
  }
}