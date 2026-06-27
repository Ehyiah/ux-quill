export class TranslateFeature {
  constructor(quill, aiManager) {
    this.name = 'translate';
    this.label = 'Traduire';
    this.requiresSelection = true;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
  }
  async trigger() {
    const quill = this.quill;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) {
      return;
    }
    const selectedText = quill.getText(selection.index, selection.length).trim();
    if (!selectedText) return;
    const targetLang = await this.promptLanguage();
    if (!targetLang) return;
    const provider = this.aiManager.getProvider();
    try {
      const translated = await provider.translate(selectedText, targetLang);
      quill.updateContents([{
        retain: selection.index
      }, {
        delete: selection.length
      }, {
        insert: translated
      }]);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  }
  async promptLanguage() {
    const languages = [{
      code: 'fr',
      label: 'Fran\u00E7ais',
      flag: '\uD83C\uDDEB\uD83C\uDDF7'
    }, {
      code: 'en',
      label: 'English',
      flag: '\uD83C\uDDEC\uD83C\uDDE7'
    }, {
      code: 'es',
      label: 'Espa\u00F1ol',
      flag: '\uD83C\uDDEA\uD83C\uDDF8'
    }, {
      code: 'de',
      label: 'Deutsch',
      flag: '\uD83C\uDDE9\uD83C\uDDEA'
    }, {
      code: 'it',
      label: 'Italiano',
      flag: '\uD83C\uDDEE\uD83C\uDDF9'
    }, {
      code: 'pt',
      label: 'Portugu\u00EAs',
      flag: '\uD83C\uDDF5\uD83C\uDDF9'
    }, {
      code: 'nl',
      label: 'Nederlands',
      flag: '\uD83C\uDDF3\uD83C\uDDF1'
    }, {
      code: 'pl',
      label: 'Polski',
      flag: '\uD83C\uDDF5\uD83C\uDDF1'
    }, {
      code: 'ru',
      label: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
      flag: '\uD83C\uDDF7\uD83C\uDDFA'
    }, {
      code: 'zh',
      label: '\u4E2D\u6587',
      flag: '\uD83C\uDDE8\uD83C\uDDF3'
    }, {
      code: 'ja',
      label: '\u65E5\u672C\u8A9E',
      flag: '\uD83C\uDDEF\uD83C\uDDF5'
    }, {
      code: 'ko',
      label: '\uD55C\uAD6D\uC5B4',
      flag: '\uD83C\uDDF0\uD83C\uDDF7'
    }, {
      code: 'ar',
      label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
      flag: '\uD83C\uDDE6\uD83C\uDDEA'
    }, {
      code: 'hi',
      label: '\u0939\u093F\u0928\u094D\u0926\u0940',
      flag: '\uD83C\uDDEE\uD83C\uDDF3'
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';
      container.style.maxHeight = '320px';
      container.style.overflowY = 'auto';
      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = 'Langue de destination';
      container.appendChild(title);
      languages.forEach(lang => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';
        const icon = document.createElement('span');
        icon.textContent = lang.flag;
        icon.style.cssText = 'flex-shrink:0;width:24px;text-align:center;font-size:16px;';
        const text = document.createElement('span');
        text.style.cssText = 'flex:1;';
        text.textContent = lang.label;
        item.appendChild(icon);
        item.appendChild(text);
        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(lang.code);
        });
        container.appendChild(item);
      });
      const outsideClick = e => {
        if (!container.contains(e.target)) {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(null);
        }
      };
      setTimeout(() => {
        document.addEventListener('click', outsideClick);
      }, 0);
      document.body.appendChild(container);
      const rect = (_window$getSelection = window.getSelection()) == null || (_window$getSelection = _window$getSelection.getRangeAt(0)) == null ? void 0 : _window$getSelection.getBoundingClientRect();
      if (rect) {
        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(rect.left, maxX));
        container.style.left = x + "px";
        container.style.top = rect.bottom + 4 + "px";
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}