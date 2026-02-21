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
      ...options
    };

    // Use the ID of the container which now has a unique ID from the Twig template
    const id = this.quill.container.id || 'default';
    this.storageKey = `quill_autosave_${id}${this.options.key_suffix ? `_${this.options.key_suffix}` : ''}`;
    this.injectStyles();

    // Wait a small bit to let the Stimulus controller load initial data from the hidden input
    setTimeout(() => this.init(), 100);
  }
  init() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      const currentContent = this.quill.root.innerHTML;
      const isEmpty = currentContent === '<p><br></p>' || currentContent === '' || currentContent === '<p></p>';
      if (this.options.restore_type === 'auto' && isEmpty) {
        this.restore(savedData);
      } else if (savedData !== currentContent && !isEmpty) {
        this.showRestoreNotification(savedData);
      } else if (isEmpty && savedData !== currentContent) {
        // Case where editor is empty but we have data (and not auto mode)
        this.showRestoreNotification(savedData);
      }
    }
    this.quill.on('text-change', () => {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.save(), this.options.interval);
    });
    const form = this.quill.container.closest('form');
    if (form) {
      form.addEventListener('submit', () => this.clear());
    }
  }
  save() {
    const content = this.quill.root.innerHTML;
    const isEmpty = content === '<p><br></p>' || content === '' || content === '<p></p>';
    if (isEmpty) {
      this.clear();
      return;
    }
    localStorage.setItem(this.storageKey, content);
  }
  restore(content) {
    this.quill.root.innerHTML = content;
    // Important: tell Quill that content has changed to trigger Stimulus sync back to the hidden input
    this.quill.update();
  }
  clear() {
    localStorage.removeItem(this.storageKey);
  }
  showRestoreNotification(savedData) {
    const id = `quill-autosave-notification-${this.quill.container.id}`;
    if (document.getElementById(id)) return;
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = 'ql-autosave-notification';
    notification.innerHTML = `
            <span>Une version non enregistrée de votre texte a été trouvée.</span>
            <div class="ql-autosave-actions">
                <button type="button" class="ql-restore-btn">Restaurer</button>
                <button type="button" class="ql-ignore-btn">Ignorer</button>
            </div>
        `;

    // Insert before the editor container
    const container = this.quill.container.parentElement;
    if (container) {
      container.insertBefore(notification, this.quill.container);
    }
    notification.querySelector('.ql-restore-btn')?.addEventListener('click', () => {
      this.restore(savedData);
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