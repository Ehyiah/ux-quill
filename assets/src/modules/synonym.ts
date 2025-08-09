interface SynonymModuleOptions {
    lang?: string;
}

class SynonymModule {
    private debounceTimeout: number | null = null;
    private popup: HTMLElement | null = null;
    private container: HTMLElement;
    private lang: string;
    private quill: any;

    constructor(quill: any, options: SynonymModuleOptions = {}) {
        this.quill = quill;
        this.lang = options.lang || 'fr';
        this.container = quill.container;

        setTimeout(() => this.addToolbarButton(), 100);
    }

    private addToolbarButton(): void {
        const toolbar = this.quill.getModule('toolbar');
        if (!toolbar) return;

        let group = toolbar.container.querySelector('.ql-formats');
        if (!group) {
            group = document.createElement('span');
            group.classList.add('ql-formats');
            toolbar.container.appendChild(group);
        }

        if (!toolbar.container.querySelector('.ql-synonym')) {
            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('ql-synonym');
            button.title = 'Trouver un synonyme';
            button.innerHTML = '🔄';

            button.addEventListener('click', () => this.showSynonyms());

            group.appendChild(button);
        }
    }

    private async showSynonyms(): Promise<void> {
        const range = this.quill.getSelection();
        if (!range || range.length === 0) return;

        const selectedText = this.quill.getText(range.index, range.length).trim();
        if (!selectedText) return;

        const normalized = selectedText.toLowerCase();

        const url = `https://api.conceptnet.io/query?node=/c/${this.lang}/${encodeURIComponent(
            normalized
        )}&rel=/r/Synonym&limit=20`;

        let data: any;
        try {
            const res = await fetch(url);
            data = await res.json();
        } catch {
            alert('Erreur lors de la récupération des synonymes');
            return;
        }

        const synonyms = new Set<string>();

        if (Array.isArray(data.edges)) {
            data.edges.forEach((edge: any) => {
                [edge.start, edge.end].forEach((node: any) => {
                    if (
                        node.language === this.lang &&
                        node.label.toLowerCase() !== normalized
                    ) {
                        synonyms.add(node.label);
                    }
                });
            });
        }

        if (synonyms.size === 0) {
            alert('Aucun synonyme trouvé');
            return;
        }

        this.openPopup([...synonyms], selectedText, range);
    }

    private openPopup(
        synonyms: string[],
        selectedText: string,
        range: { index: number; length: number }
    ): void {
        if (this.popup) this.closePopup();

        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.zIndex = '1000';
        popup.style.background = '#fff';
        popup.style.border = '1px solid #ccc';
        popup.style.padding = '10px';
        popup.style.borderRadius = '4px';
        popup.style.width = '300px';
        popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        popup.style.fontFamily = 'Arial, sans-serif';

        const bounds = this.quill.getBounds(range.index, range.length);
        const containerRect = this.container.getBoundingClientRect();

        popup.style.left = `${bounds.left + containerRect.left}px`;
        popup.style.top = `${bounds.top + containerRect.top + bounds.height + 5}px`;

        // Header with label and close button
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';

        const label = document.createElement('span');
        label.textContent = 'Recherche de synonymes';
        label.style.fontWeight = 'bold';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.title = 'Fermer';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.lineHeight = '1';
        closeBtn.addEventListener('click', () => this.closePopup());

        header.appendChild(label);
        header.appendChild(closeBtn);

        popup.appendChild(header);

        // Input text for user to edit / type synonym
        const input = document.createElement('input');
        input.type = 'text';
        input.value = synonyms[0] || '';
        input.style.width = '100%';
        input.style.marginBottom = '8px';
        popup.appendChild(input);

        // Debounce user input to re-query synonyms after pause
        input.addEventListener('input', () => {
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            this.debounceTimeout = window.setTimeout(() => {
                this.fetchAndUpdateSynonyms(input.value.toLowerCase(), synonyms, input, popup);
            }, 500);
        });

        // List of clickable synonyms
        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';
        list.style.margin = '0 0 8px 0';
        list.style.maxHeight = '100px';
        list.style.overflowY = 'auto';

        synonyms.forEach((s) => {
            const li = document.createElement('li');
            li.textContent = s;
            li.style.padding = '4px 8px';
            li.style.cursor = 'pointer';
            li.style.borderRadius = '3px';
            li.addEventListener('mouseenter', () => {
                li.style.background = '#eee';
            });
            li.addEventListener('mouseleave', () => {
                li.style.background = 'transparent';
            });
            li.addEventListener('click', () => {
                input.value = s;
            });
            list.appendChild(li);
        });

        popup.appendChild(list);

        // Buttons OK / Cancel
        const buttons = document.createElement('div');
        buttons.style.textAlign = 'right';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Annuler';
        btnCancel.style.marginRight = '8px';
        btnCancel.addEventListener('click', () => this.closePopup());

        const btnOk = document.createElement('button');
        btnOk.textContent = 'Remplacer';
        btnOk.addEventListener('click', () => {
            const val = input.value.trim();
            if (val && val !== selectedText) {
                this.quill.deleteText(range.index, range.length, 'user');
                this.quill.insertText(range.index, val, 'user');
                this.quill.setSelection(range.index + val.length, 0, 'user');
            }
            this.closePopup();
        });

        buttons.appendChild(btnCancel);
        buttons.appendChild(btnOk);
        popup.appendChild(buttons);

        this.container.appendChild(popup);
        input.focus();
        this.popup = popup;
    }

    private async fetchAndUpdateSynonyms(
        word: string,
        synonyms: string[],
        input: HTMLInputElement,
        popup: HTMLElement
    ): Promise<void> {
        if (!word) return;

        const url = `https://api.conceptnet.io/query?node=/c/${this.lang}/${encodeURIComponent(
            word
        )}&rel=/r/Synonym&limit=20`;

        let data: any;
        try {
            const res = await fetch(url);
            data = await res.json();
        } catch {
            // silently fail or optionally alert
            return;
        }

        const newSynonyms = new Set<string>();

        if (Array.isArray(data.edges)) {
            data.edges.forEach((edge: any) => {
                [edge.start, edge.end].forEach((node: any) => {
                    if (node.language === this.lang && node.label.toLowerCase() !== word) {
                        newSynonyms.add(node.label);
                    }
                });
            });
        }

        if (newSynonyms.size === 0) return;

        // Update synonym list in popup
        const ul = popup.querySelector('ul');
        if (!ul) return;

        ul.innerHTML = '';
        newSynonyms.forEach((s) => {
            const li = document.createElement('li');
            li.textContent = s;
            li.style.padding = '4px 8px';
            li.style.cursor = 'pointer';
            li.style.borderRadius = '3px';
            li.addEventListener('mouseenter', () => {
                li.style.background = '#eee';
            });
            li.addEventListener('mouseleave', () => {
                li.style.background = 'transparent';
            });
            li.addEventListener('click', () => {
                input.value = s;
            });
            ul.appendChild(li);
        });
    }

    private closePopup(): void {
        if (this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
            this.popup = null;
        }
    }
}

export default SynonymModule;
