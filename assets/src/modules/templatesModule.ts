import Quill from 'quill';

type TemplateOption = {
    label: string;
    content: string;
}

const DEFAULT_ICON = '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><rect class="ql-stroke" x="1" y="1" width="16" height="6" rx="1"/><rect class="ql-stroke" x="1" y="9" width="7" height="8" rx="1"/><rect class="ql-stroke" x="10" y="9" width="7" height="8" rx="1"/></svg>';

function isTemplateOption(item: unknown): item is TemplateOption {
    return (
        typeof item === 'object' &&
        item !== null &&
        'label' in item &&
        'content' in item
    );
}

function readIconFromToolbar(quill: Quill): string | null {
    const toolbarOptions = (quill as any).options?.modules?.toolbar;
    if (!Array.isArray(toolbarOptions)) {
        return null;
    }
    for (const group of toolbarOptions) {
        const items = Array.isArray(group) ? group : [group];
        for (const item of items) {
            if (typeof item === 'object' && item !== null && 'template' in item) {
                const val = (item as Record<string, unknown>).template;
                return typeof val === 'string' ? val : null;
            }
        }
    }
    return null;
}

export class TemplatesModule {
    constructor(private quill: Quill, private options: unknown) {
        this.setup();
    }

    private setup(): void {
        const toolbar = this.quill.getModule('toolbar') as any;
        if (!toolbar?.container) {
            return;
        }

        const buttons = toolbar.container.querySelectorAll('.ql-template') as NodeListOf<HTMLElement>;
        if (buttons.length === 0) {
            return;
        }

        toolbar.addHandler('template', () => {});

        const templates = this.normalizeOptions(this.options);
        const icon = readIconFromToolbar(this.quill);

        buttons.forEach(btn => {
            this.setupButton(btn, templates, icon, toolbar.container);
        });
    }

    private setupButton(btn: HTMLElement, templates: TemplateOption[], icon: string | null, container: HTMLElement): void {
        if (btn.dataset.templateInitialized) {
            return;
        }
        btn.dataset.templateInitialized = 'true';

        btn.innerHTML = icon ?? DEFAULT_ICON;
        btn.setAttribute('title', 'Templates');

        if (!templates.length) {
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'ql-template-dropdown';
        dropdown.style.cssText = [
            'display:none',
            'position:fixed',
            'background:#fff',
            'border:1px solid #ccc',
            'border-radius:4px',
            'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
            'z-index:9999',
            'min-width:150px',
            'padding:4px 0',
        ].join(';');

        document.body.appendChild(dropdown);

        templates.forEach((tpl) => {
            const item = document.createElement('div');
            item.textContent = tpl.label;
            item.style.cssText = 'padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:14px;color:#444;';
            item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#f0f0f0'; });
            item.addEventListener('mouseleave', () => { item.style.backgroundColor = ''; });
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const range = this.quill.getSelection(true);
                if (range) {
                    this.quill.clipboard.dangerouslyPasteHTML(range.index, tpl.content);
                }
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(item);
        });

        const toggleDropdown = () => {
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            } else {
                document.querySelectorAll('.ql-template-dropdown').forEach((el: any) => el.style.display = 'none');

                const rect = btn.getBoundingClientRect();
                dropdown.style.top = `${rect.bottom + window.scrollY}px`;
                dropdown.style.left = `${rect.left + window.scrollX}px`;
                dropdown.style.display = 'block';
            }
        };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        window.addEventListener('scroll', () => { dropdown.style.display = 'none'; }, true);
        window.addEventListener('resize', () => { dropdown.style.display = 'none'; });
        document.addEventListener('mousedown', (e) => {
            if (!btn.contains(e.target as Node) && !dropdown.contains(e.target as Node)) {
                dropdown.style.display = 'none';
            }
        });
    }

    private normalizeOptions(options: unknown): TemplateOption[] {
        if (Array.isArray(options)) {
            return options.filter(isTemplateOption);
        }

        if (typeof options !== 'object' || options === null) {
            return [];
        }

        if ('label' in options && 'content' in options) {
            return [options as TemplateOption];
        }

        // PHP may serialize sequential arrays as objects with numeric string keys {"0": {...}, "1": {...}}
        return Object.values(options as Record<string, unknown>).filter(isTemplateOption);
    }
}
