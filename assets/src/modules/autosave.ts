import Quill from 'quill';

type AutosaveOptions = {
    interval: number;
    restore_type: 'manual' | 'auto';
    key_suffix: string | null;
    notificationText: string;
    restoreButtonLabel: string;
    ignoreButtonLabel: string;
};

export class Autosave {
    private quill: Quill;
    private options: AutosaveOptions;
    private storageKey: string;
    private saveTimeout: any = null;

    constructor(quill: Quill, options: AutosaveOptions) {
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
        const id = this.quill.container.id || 'default';
        this.storageKey = `quill_autosave_${id}${this.options.key_suffix ? `_${this.options.key_suffix}` : ''}`;

        this.injectStyles();

        // Wait a small bit to let the Stimulus controller load initial data from the hidden input
        setTimeout(() => this.init(), 100);
    }

    private init(): void {
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

    private save(): void {
        const content = this.quill.root.innerHTML;
        const isEmpty = content === '<p><br></p>' || content === '' || content === '<p></p>';

        if (isEmpty) {
            this.clear();
            return;
        }
        localStorage.setItem(this.storageKey, content);
    }

    private restore(content: string): void {
        this.quill.root.innerHTML = content;
        // Important: tell Quill that content has changed to trigger Stimulus sync back to the hidden input
        this.quill.update();
    }

    private clear(): void {
        localStorage.removeItem(this.storageKey);
    }

    private showRestoreNotification(savedData: string): void {
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
            this.restore(savedData);
            notification.remove();
        });

        notification.querySelector('.ql-ignore-btn')?.addEventListener('click', () => {
            this.clear();
            notification.remove();
        });
    }

    private injectStyles(): void {
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
