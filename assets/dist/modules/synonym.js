const PROVIDERS = {
  conceptnet: {
    name: 'conceptnet',
    buildUrl(lang, term) {
      return `https://api.conceptnet.io/query?node=/c/${lang}/${encodeURIComponent(term)}&rel=/r/Synonym`;
    },
    parseResponse(data, lang, term) {
      const synonyms = new Set();
      if (Array.isArray(data.edges)) {
        data.edges.forEach(edge => {
          [edge.start, edge.end].forEach(node => {
            if (node.language === lang && node.label.toLowerCase() !== term) {
              synonyms.add(node.label);
            }
          });
        });
      }
      return [...synonyms];
    }
  },
  datamuse: {
    name: 'datamuse',
    buildUrl(lang, term) {
      return `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(term)}&max=20`;
    },
    parseResponse(data, lang, term) {
      if (Array.isArray(data)) {
        return data.map(item => item.word).filter(word => word.toLowerCase() !== term);
      }
      return [];
    }
  },
  freedictionary: {
    name: 'freedictionary',
    buildUrl(lang, term) {
      return `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${encodeURIComponent(term)}`;
    },
    parseResponse(data, lang, term) {
      const synonyms = new Set();
      if (Array.isArray(data)) {
        data.forEach(entry => {
          if (Array.isArray(entry.meanings)) {
            entry.meanings.forEach(meaning => {
              if (Array.isArray(meaning.synonyms)) {
                meaning.synonyms.forEach(synonym => {
                  if (synonym.toLowerCase() !== term) {
                    synonyms.add(synonym);
                  }
                });
              }
            });
          }
        });
      }
      return [...synonyms];
    }
  },
  wordsapi: {
    name: 'wordsapi',
    requiresApiKey: true,
    buildUrl(lang, term, _apiKey) {
      return `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(term)}/synonyms`;
    },
    parseResponse(data, _lang, term) {
      const synonyms = [];
      if (Array.isArray(data.synonyms)) {
        return data.synonyms.filter(synonym => synonym.toLowerCase() !== term);
      }
      return synonyms;
    }
  },
  babelnet: {
    name: 'babelnet',
    requiresApiKey: true,
    buildUrl(lang, term, apiKey) {
      // BabelNet API - Step 1: Get synset IDs
      return `https://babelnet.io/v9/getSynsetIds?lemma=${encodeURIComponent(term)}&searchLang=${lang.toUpperCase()}&key=${apiKey}`;
    },
    parseResponse(_data, _lang, _term) {
      // This will be handled specially in fetchSynonyms for BabelNet
      // because it requires two API calls
      return [];
    }
  }
};
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
  providers;
  wordsApiKey;
  babelnetApiKey;
  debug;
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.lang = options.lang || 'en';
    this.icon = options.icon || '🔄';
    this.headerText = options.headerText || 'Look for synonyms';
    this.container = quill.container;
    this.popup = null;
    this.debounceTimeout = null;
    this.noSynonymText = options.noSynonymText || 'No Results for : {word}';
    this.cache = new Map();
    this.currentSearchController = null;
    this.outsideClickListener = null;
    this.wordsApiKey = options.wordsApiKey;
    this.babelnetApiKey = options.babelnetApiKey;
    this.debug = options.debug || false;
    const providerNames = options.providers || ['conceptnet', 'freedictionary', 'datamuse'];
    this.providers = providerNames.filter(name => PROVIDERS[name]).map(name => PROVIDERS[name]).filter(provider => {
      // Filter out providers that require API key if no key is provided
      if (provider.requiresApiKey) {
        if (provider.name === 'babelnet' && !this.babelnetApiKey) {
          console.warn(`Provider "${provider.name}" requires a BabelNet API key but none was provided. Skipping.`);
          return false;
        }
        if (provider.name === 'wordsapi' && !this.wordsApiKey) {
          console.warn(`Provider "${provider.name}" requires a WordsAPI key but none was provided. Skipping.`);
          return false;
        }
      }
      return true;
    });
    if (this.debug) {
      console.log('[SynonymModule] Initialized with options:', {
        lang: this.lang,
        providers: this.providers.map(p => p.name),
        debug: this.debug,
        hasWordsApiKey: !!this.wordsApiKey,
        hasBabelNetApiKey: !!this.babelnetApiKey
      });
    }
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
      alert('Erreur while fetching synonyms');
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
      const cached = this.cache.get(cacheKey);
      if (this.debug) {
        console.log(`[SynonymModule] Cache hit for "${normalized}":`, cached);
      }
      return cached || [];
    }
    if (this.debug) {
      console.log(`[SynonymModule] Fetching synonyms for '${normalized}' (lang: ${this.lang})`);
      console.log('[SynonymModule] Providers to try:', this.providers.map(p => p.name));
    }
    let signal;
    if (options.cancellable) {
      if (this.currentSearchController) {
        this.currentSearchController.abort();
      }
      this.currentSearchController = new AbortController();
      signal = this.currentSearchController.signal;
    }
    let lastError = null;

    // Try each configured provider in order
    for (const provider of this.providers) {
      try {
        // Get the appropriate API key for this provider
        let apiKeyToUse;
        if (provider.name === 'babelnet') {
          apiKeyToUse = this.babelnetApiKey;
        } else if (provider.name === 'wordsapi') {
          apiKeyToUse = this.wordsApiKey;
        }
        const url = provider.buildUrl(this.lang, normalized, apiKeyToUse);
        if (this.debug) {
          console.log(`[SynonymModule] Trying provider '${provider.name}'...`);
          console.log('[SynonymModule] Request URL:', url);
        }

        // Build fetch options
        const fetchOptions = {
          signal
        };

        // Add headers for providers that require API key
        // BabelNet passes the key in the URL, no need for headers
        if (provider.name === 'wordsapi' && this.wordsApiKey) {
          fetchOptions.headers = {
            'X-RapidAPI-Key': this.wordsApiKey,
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
          };
          if (this.debug) {
            console.log(`[SynonymModule] Using WordsAPI key for '${provider.name}'`);
          }
        }
        const startTime = Date.now();
        const res = await fetch(url, fetchOptions);
        const responseTime = Date.now() - startTime;
        if (this.debug) {
          console.log(`[SynonymModule] Response from '${provider.name}':`, {
            status: res.status,
            statusText: res.statusText,
            responseTime: `${responseTime}ms`
          });
        }
        const data = await res.json();
        if (this.debug) {
          console.log(`[SynonymModule] Response data from '${provider.name}':`, data);
        }
        let synonyms = [];

        // Special handling for BabelNet (requires 2 API calls)
        if (provider.name === 'babelnet') {
          const synsetIds = [];

          // Extract synset IDs from first response
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.id) {
                synsetIds.push(item.id);
              }
            });
          }
          if (this.debug) {
            console.log('[SynonymModule] BabelNet synset IDs:', synsetIds);
          }

          // Fetch details for each synset ID (limit to first 3 to avoid too many requests)
          const synonymsSet = new Set();
          const maxSynsets = Math.min(synsetIds.length, 3);
          for (let i = 0; i < maxSynsets; i++) {
            const synsetId = synsetIds[i];
            try {
              const synsetUrl = `https://babelnet.io/v9/getSynset?id=${synsetId}&targetLang=${this.lang.toUpperCase()}&key=${this.babelnetApiKey}`;
              if (this.debug) {
                console.log(`[SynonymModule] Fetching BabelNet synset ${i + 1}/${maxSynsets}:`, synsetUrl);
              }
              const synsetRes = await fetch(synsetUrl, {
                signal
              });
              const synsetData = await synsetRes.json();
              if (this.debug) {
                console.log('[SynonymModule] BabelNet synset data:', synsetData);
              }

              // Extract synonyms from senses
              if (Array.isArray(synsetData.senses)) {
                if (this.debug && synsetData.senses.length > 0) {
                  console.log('[SynonymModule] BabelNet sense structure (first sense):', synsetData.senses[0]);
                  // Log all lemmas in this synset
                  const allLemmas = synsetData.senses.map(s => s.properties?.simpleLemma || 'N/A');
                  console.log('[SynonymModule] All lemmas in synset:', allLemmas);
                }
                synsetData.senses.forEach(sense => {
                  // Try multiple possible structures
                  let lemma = null;
                  let senseLang = null;

                  // Structure 1: sense.properties.simpleLemma
                  if (sense.properties) {
                    lemma = sense.properties.simpleLemma || sense.properties.fullLemma || sense.properties.lemma;
                    senseLang = sense.properties.language;
                  }
                  // Structure 2: sense.lemma directly
                  else if (sense.lemma) {
                    lemma = sense.lemma.lemma || sense.lemma.simpleLemma || sense.lemma;
                    senseLang = sense.lemma.language || sense.language;
                  }
                  // Structure 3: direct properties on sense
                  else {
                    lemma = sense.simpleLemma || sense.fullLemma || sense.lemma;
                    senseLang = sense.language;
                  }

                  // Add the lemma if it matches the target language and is not the search term
                  if (lemma && lemma.toLowerCase() !== normalized) {
                    // Strict language filter: only accept if language matches exactly
                    const langMatches = senseLang === this.lang.toUpperCase();

                    // Filter out Wikipedia-style entries (entries with parentheses like "Bonjour_(album)")
                    const isNotWikipedia = !lemma.includes('(');
                    if (langMatches && isNotWikipedia) {
                      // Replace underscores with spaces for multi-word expressions
                      const cleanedLemma = lemma.replace(/_/g, ' ');
                      synonymsSet.add(cleanedLemma);
                    }
                  }
                });
              }
            } catch (synsetError) {
              if (this.debug) {
                console.error(`[SynonymModule] Error fetching BabelNet synset ${synsetId}:`, synsetError);
              }
            }
          }
          synonyms = [...synonymsSet];
        } else {
          // Standard processing for other providers
          synonyms = provider.parseResponse(data, this.lang, normalized);
        }
        if (this.debug) {
          console.log(`[SynonymModule] Parsed synonyms from '${provider.name}':`, synonyms);
        }
        if (synonyms.length > 0) {
          this.cache.set(cacheKey, synonyms);
          if (this.debug) {
            console.log(`[SynonymModule] ✓ Success with '${provider.name}' - Found ${synonyms.length} synonyms`);
          }
          return synonyms;
        } else {
          if (this.debug) {
            console.log(`[SynonymModule] ✗ No synonyms found with '${provider.name}', trying next provider...`);
          }
        }
      } catch (e) {
        lastError = e;
        if (this.debug) {
          console.error(`[SynonymModule] ✗ Error with provider '${provider.name}':`, e);
        }
        // If it's an abort, don't continue to fallback
        if (e && e.name === 'AbortError') {
          if (this.debug) {
            console.log('[SynonymModule] Request aborted');
          }
          if (options.silent) {
            return [];
          }
          throw e;
        }
        // Otherwise continue to next provider (fallback)
        continue;
      } finally {
        if (options.cancellable) {
          this.currentSearchController = null;
        }
      }
    }
    if (this.debug) {
      console.error(`[SynonymModule] ✗ All providers failed for '${normalized}'`);
    }
    if (options.silent) {
      return [];
    }
    throw lastError || new Error('All synonym providers failed');
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