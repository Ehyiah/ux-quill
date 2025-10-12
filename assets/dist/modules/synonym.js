class SynonymModule {
  quill;
  lang;
  container;
  popup;
  debounceTimeout;
  icon;
  headerText;
  noSynonymText;
  cache;
  currentSearchController;
  outsideClickListener;
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.lang = options.lang || 'fr';
    this.icon = options.icon || '🔄';
    this.headerText = options.headerText || 'Recherche de synonymes';
    this.container = quill.container;
    this.popup = null;
    this.debounceTimeout = null;
    this.noSynonymText = options.noSynonymText || 'Aucun synonyme trouvé : {word}';
    this.cache = new Map();
    this.currentSearchController = null;
    this.outsideClickListener = null;
    setTimeout(() => this.addToolbarButton(), 100);
  }
  addToolbarButton() {
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
          // If simple text or emoji/icon
          button.textContent = this.icon;
        }
      } else if (this.icon instanceof HTMLElement) {
        button.appendChild(this.icon.cloneNode(true));
      }
      button.addEventListener('click', () => this.showSynonyms());
      group.appendChild(button);
    }
  }
  async showSynonyms() {
    const range = this.quill.getSelection();
    if (!range) return;
    let selectedText = null;
    let usedRange = null; // object with { index, length }

    if (range.length && range.length > 0) {
      selectedText = this.quill.getText(range.index, range.length).trim();
      if (!selectedText) return;
      usedRange = {
        index: range.index,
        length: range.length
      };
    } else {
      // No selection: find the word under the cursor
      const fullText = this.quill.getText(0, this.quill.getLength());
      const pos = range.index;
      let start = pos;
      let end = pos;

      // use Unicode-aware letter matcher (letters, marks), allow apostrophes and hyphens
      const letterRe = /[\p{L}\p{M}'’-]/u;
      // move start back while previous char is part of word
      while (start > 0 && letterRe.test(fullText.charAt(start - 1))) {
        start--;
      }
      // move end forward while char is part of word
      while (end < fullText.length && letterRe.test(fullText.charAt(end))) {
        end++;
      }

      // slice found word
      const word = fullText.slice(start, end).trim();
      if (!word) return;

      // optionally select the word in the editor so the user sees it
      try {
        this.quill.setSelection(start, end - start, 'user');
      } catch (e) {
        // ignore if setSelection fails for any reason
      }
      selectedText = word;
      usedRange = {
        index: start,
        length: end - start
      };
    }
    if (!selectedText || !usedRange) return;
    let synonyms = [];
    try {
      synonyms = await this.fetchSynonyms(selectedText, {
        silent: false
      });
    } catch {
      alert('Erreur lors de la récupération des synonymes');
      return;
    }
    this.openPopup(synonyms, selectedText, usedRange);
  }
  openPopup(synonyms, selectedText, range) {
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
    popup.style.transition = 'opacity 0.3s ease';
    const containerRect = this.container.getBoundingClientRect();
    const bounds = this.quill.getBounds(range.index, range.length);
    const popupWidth = 320;
    const popupHeight = 200;
    let left = bounds.left + bounds.width / 2 - popupWidth / 2;
    left = Math.max(0, Math.min(left, containerRect.width - popupWidth));
    let top = bounds.top + bounds.height + 10;
    if (top + popupHeight > containerRect.height) {
      // move popup up if it would overflow the viewport
      const extraMargin = 70;
      top = bounds.top - popupHeight - extraMargin;
      if (top < 0) {
        top = 0;
      }
    }
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';
    const headerText = document.createElement('span');
    headerText.id = 'synonym-popup-title';
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
    closeBtn.style.transition = 'color 0.3s ease';
    closeBtn.title = 'Fermer';
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = '#555';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = '#888';
    });
    closeBtn.addEventListener('click', () => this.closePopup());
    header.appendChild(headerText);
    header.appendChild(closeBtn);
    popup.appendChild(header);
    popup.setAttribute('aria-labelledby', headerText.id);
    const input = document.createElement('input');
    input.type = 'text';
    input.value = selectedText || synonyms[0] || '';
    input.style.width = '100%';
    input.style.padding = '10px 14px';
    input.style.fontSize = '1rem';
    input.style.border = '1.8px solid #ddd';
    input.style.borderRadius = '8px';
    input.style.marginBottom = '12px';
    input.style.transition = 'border-color 0.3s ease';
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

    // Liste of synonyms
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0 0 12px 0';
    list.style.maxHeight = '130px';
    list.style.overflowY = 'auto';
    list.style.borderRadius = '8px';
    list.style.border = '1px solid #eee';
    list.style.backgroundColor = '#fafafa';
    list.style.boxShadow = 'inset 0 1px 3px rgb(0 0 0 / 0.1)';
    if (synonyms.length === 0) {
      const noResult = document.createElement('li');
      noResult.textContent = this.noSynonymText.replace('{word}', selectedText);
      noResult.style.padding = '8px';
      noResult.style.color = '#888';
      noResult.style.fontStyle = 'italic';
      list.appendChild(noResult);
    } else {
      synonyms.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        li.style.padding = '8px 14px';
        li.style.cursor = 'pointer';
        li.style.borderRadius = '6px';
        li.style.transition = 'background-color 0.25s ease';
        li.addEventListener('mouseenter', () => {
          li.style.backgroundColor = '#e6f0ff';
        });
        li.addEventListener('mouseleave', () => {
          li.style.backgroundColor = 'transparent';
        });
        li.addEventListener('click', () => {
          const val = s;
          if (val && val !== selectedText) {
            this.replaceText(range, val, true);
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
    btnCancel.style.transition = 'background-color 0.3s ease';
    btnCancel.addEventListener('mouseenter', () => {
      btnCancel.style.backgroundColor = '#ddd';
    });
    btnCancel.addEventListener('mouseleave', () => {
      btnCancel.style.backgroundColor = '#f0f0f0';
    });
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
    btnOk.style.transition = 'background-color 0.3s ease';
    btnOk.addEventListener('mouseenter', () => {
      btnOk.style.backgroundColor = '#357ABD';
    });
    btnOk.addEventListener('mouseleave', () => {
      btnOk.style.backgroundColor = '#4a90e2';
    });
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
    input.addEventListener('input', () => {
      this.debounceSearch(input.value);
    });
    input.addEventListener('keydown', ev => {
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
    this.outsideClickListener = e => {
      if (this.popup && !this.popup.contains(e.target)) {
        this.closePopup();
      }
    };
    document.addEventListener('mousedown', this.outsideClickListener);
  }
  debounceSearch(value) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = window.setTimeout(() => {
      this.searchSynonyms(value);
    }, 400);
  }
  async fetchSynonyms(term, options) {
    if (options === void 0) {
      options = {};
    }
    if (!term) return [];
    const normalized = term.toLowerCase();
    const cacheKey = `${this.lang}:${normalized}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    let signal;
    if (options.cancellable) {
      if (this.currentSearchController) {
        this.currentSearchController.abort();
      }
      this.currentSearchController = new AbortController();
      signal = this.currentSearchController.signal;
    }
    const url = `https://api.conceptnet.io/query?node=/c/${this.lang}/${encodeURIComponent(normalized)}&rel=/r/Synonym&limit=20`;
    try {
      const res = await fetch(url, {
        signal
      });
      const data = await res.json();
      const synonyms = new Set();
      if (Array.isArray(data.edges)) {
        data.edges.forEach(edge => {
          [edge.start, edge.end].forEach(node => {
            if (node.language === this.lang && node.label.toLowerCase() !== normalized) {
              synonyms.add(node.label);
            }
          });
        });
      }
      const result = [...synonyms];
      this.cache.set(cacheKey, result);
      return result;
    } catch (e) {
      if (options.silent || e && e.name === 'AbortError') {
        return [];
      }
      throw e;
    } finally {
      if (options.cancellable) {
        this.currentSearchController = null;
      }
    }
  }
  replaceText(range, val, preserveFormats) {
    if (preserveFormats === void 0) {
      preserveFormats = true;
    }
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
  applyStyles(el, styles) {
    Object.assign(el.style, styles);
  }
  async searchSynonyms(term) {
    if (!term) return;
    const synonyms = await this.fetchSynonyms(term, {
      silent: true,
      cancellable: true
    });
    this.updateSynonymList(synonyms);
  }
  updateSynonymList(synonyms) {
    if (!this.popup) return;
    const list = this.popup.querySelector('ul');
    const input = this.popup.querySelector('input');
    if (!list || !input) return;
    list.innerHTML = '';
    if (synonyms.length === 0) {
      const noResult = document.createElement('li');
      noResult.textContent = this.noSynonymText.replace('{word}', input.value);
      noResult.style.padding = '8px';
      noResult.style.color = '#888';
      noResult.style.fontStyle = 'italic';
      list.appendChild(noResult);
    } else {
      synonyms.forEach(s => {
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
          if (input) {
            input.value = s;
            this.debounceSearch(input.value);
          }
        });
        list.appendChild(li);
      });
    }
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
  destroy() {
    this.closePopup();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    if (this.currentSearchController) {
      this.currentSearchController.abort();
      this.currentSearchController = null;
    }
  }
}
export default SynonymModule;