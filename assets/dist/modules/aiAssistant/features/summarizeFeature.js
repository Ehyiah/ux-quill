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
      label: 'Paragraphe'
    }, {
      value: 'bullets',
      label: 'Points clés'
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'quill-ai-dropdown';
      container.style.cssText = 'position:fixed;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;min-width:160px;';
      options.forEach(opt => {
        const item = document.createElement('button');
        item.textContent = opt.label;
        item.style.cssText = 'display:block;width:100%;padding:8px 16px;border:none;background:none;text-align:left;cursor:pointer;font-size:14px;';
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f0f0f0';
        });
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = '';
        });
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
        container.style.top = rect.bottom + 4 + "px";
        container.style.left = rect.left + "px";
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}