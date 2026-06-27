export class SummarizeFeature {
  constructor(quill, aiManager) {
    this.name = 'summarize';
    this.label = 'Résumer';
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
  }
  async trigger() {
    const quill = this.quill;
    const selection = quill.getSelection();
    let textToSummarize;
    let insertIndex;
    if (selection && selection.length > 0) {
      textToSummarize = quill.getText(selection.index, selection.length).trim();
      insertIndex = selection.index + selection.length;
    } else {
      textToSummarize = quill.getText().trim();
      insertIndex = quill.getLength();
    }
    if (!textToSummarize) return;
    const format = await this.promptFormat();
    if (!format) return;
    const provider = this.aiManager.getProvider();
    try {
      const summary = await provider.summarize(textToSummarize, format);
      const prefix = format === 'bullets' ? '\n\nRésumé :\n' : '\n\nRésumé : ';
      quill.updateContents([{
        retain: insertIndex
      }, {
        insert: "" + prefix + summary
      }]);
    } catch (error) {
      console.error('Summarization failed:', error);
    }
  }
  async promptFormat() {
    const options = [{
      value: 'paragraph',
      label: 'Paragraphe',
      desc: 'R\u00E9sum\u00E9 r\u00E9dig\u00E9 en quelques phrases',
      icon: '\uD83D\uDCDD'
    }, {
      value: 'bullets',
      label: 'Points cl\u00E9s',
      desc: 'Liste des id\u00E9es principales',
      icon: '\uD83D\uDCCC'
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';
      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = 'Format du r\u00E9sum\u00E9';
      container.appendChild(title);
      options.forEach(opt => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';
        const icon = document.createElement('span');
        icon.textContent = opt.icon;
        icon.style.cssText = 'flex-shrink:0;width:24px;text-align:center;font-size:16px;';
        const text = document.createElement('span');
        text.style.cssText = 'flex:1;min-width:0;';
        text.innerHTML = "<div style=\"font-size:13px;font-weight:500;\">" + opt.label + "</div><div style=\"font-size:11px;color:#888;\">" + opt.desc + "</div>";
        item.appendChild(icon);
        item.appendChild(text);
        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(opt.value);
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