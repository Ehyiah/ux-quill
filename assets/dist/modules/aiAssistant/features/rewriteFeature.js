export class RewriteFeature {
  constructor(quill, aiManager) {
    this.name = 'rewrite';
    this.label = 'Reformuler';
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
    const style = await this.promptStyle();
    if (!style) return;
    const provider = this.aiManager.getProvider();
    try {
      const rewritten = await provider.rewrite(selectedText, style);
      quill.updateContents([{
        retain: selection.index
      }, {
        delete: selection.length
      }, {
        insert: rewritten
      }]);
    } catch (error) {
      console.error('Rewrite failed:', error);
    }
  }
  async promptStyle() {
    const styles = [{
      value: 'formal',
      label: 'Formel'
    }, {
      value: 'casual',
      label: 'Décontracté'
    }, {
      value: 'concise',
      label: 'Plus concis'
    }, {
      value: 'expanded',
      label: 'Plus développé'
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'quill-ai-dropdown';
      container.style.cssText = 'position:fixed;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;min-width:180px;';
      styles.forEach(s => {
        const item = document.createElement('button');
        item.textContent = s.label;
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
          resolve(s.value);
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