interface SynonymModuleOptions {
    provider: string;
    locale?: string;
    icon?: string | HTMLElement;
    headerText?: string;
    noSynonymText?: string;
    debug?: boolean;
}

interface QuillRange {
    index: number;
    length: number;
}

interface QuillLike {
    container: HTMLElement;
    getModule(name: string): any;
    getSelection(): QuillRange | null;
    getText(index: number, length?: number): string;
    getLength(): number;
    setSelection(index: number, length: number, source?: string): void;
    getBounds(index: number, length?: number): { left: number; top: number; height: number; width: number };
    deleteText(index: number, length: number, source?: string): void;
    insertText(index: number, text: string, formats?: any, source?: string): void;
    getFormat(index: number, length: number): any;
}

class SynonymModule {
    private quill: QuillLike;
    private provider: string;
    private locale: string;
    private container: HTMLElement;
    private popup: HTMLElement | null;
    private debounceTimeout: number | null;
    private icon: string | HTMLElement;
    private headerText: string;
    private noSynonymText: string;
    private outsideClickListener: ((e: MouseEvent) => void) | null;
    private debug: boolean;

    constructor(quill: QuillLike, options: SynonymModuleOptions = {} as SynonymModuleOptions) {
        this.quill = quill;
        this.provider = options.provider;
        this.locale = options.locale || 'en';
        this.icon = options.icon || '🔄';
        this.headerText = options.headerText || 'Look for synonyms';
        this.noSynonymText = options.noSynonymText || 'No Results for : {word}';
        this.container = quill.container;
        this.popup = null;
        this.debounceTimeout = null;
        this.outsideClickListener = null;
        this.debug = options.debug || false;

        if (this.debug) {
            console.log('[SynonymModule] Initialized with options:', {
                provider: this.provider,
                locale: this.locale,
                debug: this.debug,
            });
        }

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

            if (typeof this.icon === 'string') {
                const trimmed = this.icon.trim();
                if (trimmed.startsWith('<svg')) {
                    button.innerHTML = this.icon;
                } else {
                    button.textContent = this.icon;
                }
            } else if (this.icon instanceof HTMLElement) {
                button.appendChild(this.icon.cloneNode(true));
            }

            button.addEventListener('click', () => this.showSynonyms());

            group.appendChild(button);
        }
    }

    private getContext(range: QuillRange): string | null {
        const fullText = this.quill.getText(0, this.quill.getLength());
        const wordStart = range.index;
        const wordEnd = range.index + range.length;

        const sentenceStart = fullText.lastIndexOf('.', wordStart - 2) + 1;
        const sentenceEnd = fullText.indexOf('.', wordEnd);

        const start = sentenceStart > 0 ? sentenceStart + 1 : 0;
        const end = sentenceEnd > 0 ? sentenceEnd : fullText.length;

        const sentence = fullText.slice(start, end).trim();
        return sentence.length > 0 ? sentence : null;
    }

    async showSynonyms() {
        const range = this.quill.getSelection();
        if (!range) return;

        let selectedText: string | null = null;
        let usedRange: QuillRange | null = null;

        if (range.length && range.length > 0) {
            selectedText = this.quill.getText(range.index, range.length).trim();
            if (!selectedText) return;
            usedRange = { index: range.index, length: range.length };
        } else {
            const fullText = this.quill.getText(0, this.quill.getLength());
            const pos = range.index;

            let start = pos;
            let end = pos;

            const letterRe = /[\p{L}\p{M}'’-]/u;
            while (start > 0 && letterRe.test(fullText.charAt(start - 1))) {
                start--;
            }
            while (end < fullText.length && letterRe.test(fullText.charAt(end))) {
                end++;
            }

            const word = fullText.slice(start, end).trim();
            if (!word) return;

            this.quill.setSelection(start, end - start, 'user');

            selectedText = word;
            usedRange = { index: start, length: end - start };
        }

        if (!selectedText || !usedRange) return;

        const context = this.getContext(usedRange);

        let synonyms: { word: string; score: number }[] = [];
        try {
            synonyms = await this.fetchSynonyms(selectedText, context);
        } catch {
            alert('Erreur lors de la récupération des synonymes');
            return;
        }

        this.openPopup(synonyms, selectedText, usedRange);
    }

    private async fetchSynonyms(
        word: string,
        context: string | null,
    ): Promise<{ word: string; score: number }[]> {
        const response = await fetch('/_ux/quill/synonyms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                provider: this.provider,
                word,
                context,
                locale: this.locale,
            }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (this.debug) {
            console.log('[SynonymModule] Response:', data);
        }

        return data;
    }

    openPopup(synonyms: { word: string; score: number }[], selectedText: string, range: QuillRange) {
        if (this.popup) this.closePopup();

        const popup = document.createElement('div');
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');
        popup.style.position = 'absolute';
        popup.style.zIndex = '1000';
        popup.style.background = '#fff';
        popup.style.borderRadius = '12px';
        popup.style.width = '320px';
        popup.style.padding = '16px 20px';
        popup.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        popup.style.fontFamily = '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif';
        popup.style.color = '#333';
        popup.style.userSelect = 'none';

        const containerRect = this.container.getBoundingClientRect();
        const bounds = this.quill.getBounds(range.index, range.length);
        const popupWidth = 320;
        const popupHeight = 200;
        let left = bounds.left + (bounds.width / 2) - (popupWidth / 2);
        left = Math.max(0, Math.min(left, containerRect.width - popupWidth));
        let top = bounds.top + bounds.height + 10;
        if (top + popupHeight > containerRect.height) {
            const extraMargin = 70;
            top = bounds.top - popupHeight - extraMargin;
            if (top < 0) top = 0;
        }
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '12px';

        const headerText = document.createElement('span');
        headerText.textContent = this.headerText + (selectedText ? ` : "${selectedText}"` : '');
        headerText.style.fontWeight = '700';
        headerText.style.fontSize = '1.1rem';
        headerText.style.color = '#222';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✖';
        closeBtn.style.border = 'none';
        closeBtn.style.background = 'transparent';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.lineHeight = '1';
        closeBtn.style.padding = '0';
        closeBtn.style.color = '#888';
        closeBtn.title = 'Fermer';

        closeBtn.addEventListener('click', () => this.closePopup());

        header.appendChild(headerText);
        header.appendChild(closeBtn);
        popup.appendChild(header);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = selectedText || synonyms[0]?.word || '';
        input.style.width = '100%';
        input.style.padding = '10px 14px';
        input.style.fontSize = '1rem';
        input.style.border = '1.8px solid #ddd';
        input.style.borderRadius = '8px';
        input.style.marginBottom = '12px';
        input.style.outline = 'none';

        input.addEventListener('focus', () => {
            input.style.borderColor = '#4a90e2';
            input.style.boxShadow = '0 0 8px rgba(74,144,226,0.3)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#ddd';
            input.style.boxShadow = 'none';
        });

        popup.appendChild(input);

        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';
        list.style.margin = '0 0 12px 0';
        list.style.maxHeight = '130px';
        list.style.overflowY = 'auto';
        list.style.borderRadius = '8px';
        list.style.border = '1px solid #eee';
        list.style.backgroundColor = '#fafafa';

        if (synonyms.length === 0) {
            const noResult = document.createElement('li');
            noResult.textContent = this.noSynonymText.replace('{word}', selectedText);
            noResult.style.padding = '8px';
            noResult.style.color = '#888';
            noResult.style.fontStyle = 'italic';
            list.appendChild(noResult);
        } else {
            const sorted = [...synonyms].sort((a, b) => b.score - a.score);
            sorted.forEach(s => {
                const li = document.createElement('li');
                li.textContent = s.word;
                li.style.padding = '8px 14px';
                li.style.cursor = 'pointer';
                li.style.borderRadius = '6px';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                const scoreBadge = document.createElement('span');
                scoreBadge.textContent = (s.score * 100).toFixed(0) + '%';
                scoreBadge.style.fontSize = '0.75rem';
                scoreBadge.style.color = '#999';
                li.appendChild(document.createTextNode(''));
                li.appendChild(scoreBadge);

                li.addEventListener('mouseenter', () => {
                    li.style.backgroundColor = '#e6f0ff';
                });
                li.addEventListener('mouseleave', () => {
                    li.style.backgroundColor = 'transparent';
                });
                li.addEventListener('click', () => {
                    if (s.word !== selectedText) {
                        this.replaceText(range, s.word, true);
                    }
                    this.closePopup();
                });

                list.appendChild(li);
            });
        }

        popup.appendChild(list);

        const buttons = document.createElement('div');
        buttons.style.textAlign = 'right';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Annuler';
        btnCancel.style.marginRight = '12px';
        btnCancel.style.padding = '8px 16px';
        btnCancel.style.backgroundColor = '#f0f0f0';
        btnCancel.style.border = 'none';
        btnCancel.style.borderRadius = '8px';
        btnCancel.style.cursor = 'pointer';
        btnCancel.style.fontWeight = '600';
        btnCancel.style.color = '#555';

        btnCancel.addEventListener('click', () => this.closePopup());

        const btnOk = document.createElement('button');
        btnOk.textContent = 'Remplacer';
        btnOk.style.padding = '8px 18px';
        btnOk.style.backgroundColor = '#4a90e2';
        btnOk.style.border = 'none';
        btnOk.style.borderRadius = '8px';
        btnOk.style.color = 'white';
        btnOk.style.cursor = 'pointer';
        btnOk.style.fontWeight = '600';

        btnOk.addEventListener('click', () => {
            const val = input.value.trim();
            if (val && val !== selectedText) {
                this.replaceText(range, val, true);
            }
            this.closePopup();
        });

        buttons.appendChild(btnCancel);
        buttons.appendChild(btnOk);
        popup.appendChild(buttons);

        input.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                btnOk.click();
            } else if (ev.key === 'Escape') {
                ev.preventDefault();
                this.closePopup();
            }
        });

        this.container.appendChild(popup);
        input.focus();
        this.popup = popup;

        this.outsideClickListener = (e: MouseEvent) => {
            if (this.popup && !this.popup.contains(e.target as Node)) {
                this.closePopup();
            }
        };
        document.addEventListener('mousedown', this.outsideClickListener);
    }

    private replaceText(range: QuillRange, val: string, preserveFormats = true) {
        if (!val) return;
        const formats = preserveFormats ? this.quill.getFormat(range.index, range.length) : undefined;
        this.quill.deleteText(range.index, range.length, 'user');
        if (preserveFormats) {
            this.quill.insertText(range.index, val, formats, 'user');
        } else {
            this.quill.insertText(range.index, val, 'user');
        }
        this.quill.setSelection(range.index + val.length, 0, 'user');
    }

    closePopup() {
        if (this.popup && this.popup.parentNode) {
            this.popup.parentNode.removeChild(this.popup);
            this.popup = null;
        }
        if (this.outsideClickListener) {
            document.removeEventListener('mousedown', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }

    destroy(): void {
        this.closePopup();
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
    }
}

export default SynonymModule;
