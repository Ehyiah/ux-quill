export class GenerateFeature {
  constructor(quill, aiManager) {
    this.name = 'generate';
    this.label = 'Générer du contenu';
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
  }
  async trigger() {
    const prompt = await this.promptInput();
    if (!prompt) return;
    const quill = this.quill;
    const selection = quill.getSelection();
    const insertIndex = selection ? selection.index : quill.getLength();
    const provider = this.aiManager.getProvider();
    const loadingText = '...';
    quill.updateContents([{
      retain: insertIndex
    }, {
      insert: loadingText
    }]);
    try {
      let accumulated = '';
      await provider.generate(prompt, chunk => {
        accumulated += chunk;
        quill.updateContents([{
          retain: insertIndex
        }, {
          delete: loadingText.length
        }, {
          insert: accumulated
        }]);
      });
      quill.updateContents([{
        retain: insertIndex
      }, {
        delete: loadingText.length
      }, {
        insert: accumulated
      }]);
    } catch (error) {
      console.error('Generation failed:', error);
      quill.updateContents([{
        retain: insertIndex
      }, {
        delete: loadingText.length
      }, {
        insert: '[Generation failed]'
      }]);
    }
  }
  async promptInput() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:9998;display:flex;align-items:center;justify-content:center;';
      const modal = document.createElement('div');
      modal.style.cssText = 'background:#fff;border-radius:8px;padding:24px;width:500px;max-width:90vw;box-shadow:0 4px 24px rgba(0,0,0,0.2);';
      const title = document.createElement('h3');
      title.textContent = 'Générer du contenu';
      title.style.cssText = 'margin:0 0 12px;font-size:18px;';
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Décrivez ce que vous voulez générer...';
      textarea.style.cssText = 'width:100%;min-height:100px;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:14px;resize:vertical;box-sizing:border-box;';
      const buttonRow = document.createElement('div');
      buttonRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:12px;';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Annuler';
      cancelBtn.style.cssText = 'padding:8px 16px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;';
      const submitBtn = document.createElement('button');
      submitBtn.textContent = 'Générer';
      submitBtn.style.cssText = 'padding:8px 16px;border:none;border-radius:4px;background:#0066cc;color:#fff;cursor:pointer;';
      cancelBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(null);
      });
      textarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          submitBtn.click();
        }
        if (e.key === 'Escape') {
          cancelBtn.click();
        }
      });
      submitBtn.addEventListener('click', () => {
        const value = textarea.value.trim();
        overlay.remove();
        resolve(value || null);
      });
      buttonRow.appendChild(cancelBtn);
      buttonRow.appendChild(submitBtn);
      modal.appendChild(title);
      modal.appendChild(textarea);
      modal.appendChild(buttonRow);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      setTimeout(() => textarea.focus(), 100);
    });
  }
}