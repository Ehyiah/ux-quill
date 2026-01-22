import Quill from 'quill';

interface PlaceholderOptions {
    placeholders: string[];
    icon?: string | null;
    startTag?: string;
    endTag?: string;
}

interface ToolbarModule {
    container: HTMLElement;
}

const icons = Quill.import('ui/icons');
const defaultIcon = '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M5 3C4 3 3 4 3 5L3 7C3 8 2 9 2 9C2 9 3 10 3 11L3 13C3 14 4 15 5 15"></path><path class="ql-stroke" d="M13 3C14 3 15 4 15 5L15 7C15 8 16 9 16 9C16 9 15 10 15 11L15 13C15 14 14 15 13 15"></path><circle class="ql-fill" cx="7" cy="9" r="1"></circle><circle class="ql-fill" cx="11" cy="9" r="1"></circle></svg>';
icons['placeholder'] = defaultIcon;

export class PlaceholderModule {
    private quill: Quill;
    private options: PlaceholderOptions;
    private placeholders: string[];
    private dropdown: HTMLDivElement;
    private button: HTMLButtonElement;
    private startTag: string;
    private endTag: string;

    constructor(quill: Quill, options: PlaceholderOptions) {
        this.quill = quill;
        this.options = options;
        this.placeholders = options.placeholders || [];
        this.startTag = options.startTag || '{{';
        this.endTag = options.endTag || '}}';

        if (options.icon) {
            icons['placeholder'] = options.icon;
        }

        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            this.addButton(toolbar);
        }

        document.addEventListener('click', (e: Event) => {
            if (!this.button.contains(e.target as Node) && !this.dropdown.contains(e.target as Node)) {
                this.dropdown.style.display = 'none';
            }
        });
    }

    private addButton(toolbar: ToolbarModule): void {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'ql-placeholder';
        this.button.setAttribute('aria-label', 'placeholder');

        const iconSvg = icons['placeholder'];
        if (iconSvg) {
            this.button.innerHTML = iconSvg;
        }

        this.button.onclick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown();
        };

        let container = toolbar.container.querySelector('.ql-formats');
        if (!container) {
            container = document.createElement('span');
            container.className = 'ql-formats';
            toolbar.container.appendChild(container);
        }
        container.appendChild(this.button);

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'ql-placeholder-dropdown';
        this.dropdown.style.display = 'none';

        this.placeholders.forEach(ph => {
            const item = document.createElement('div');
            item.className = 'ql-placeholder-item';
            item.innerHTML = ph;
            item.onclick = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                this.insertPlaceholder(ph);
                this.toggleDropdown();
            };
            this.dropdown.appendChild(item);
        });

        this.button.parentElement?.appendChild(this.dropdown);
    }

    private toggleDropdown(): void {
        this.dropdown.style.display = this.dropdown.style.display === 'none' ? 'block' : 'none';
    }

    private insertPlaceholder(placeholder: string): void {
        const range = this.quill.getSelection(true);
        if (range) {
            const text = `${this.startTag}${placeholder}${this.endTag}`;
            this.quill.insertText(range.index, text);
            this.quill.setSelection(range.index + text.length, 0);
        }
    }
}
