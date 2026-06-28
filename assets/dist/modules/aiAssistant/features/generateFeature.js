import { showReviewModal } from "../utils/reviewModal.js";
export class GenerateFeature {
  constructor(quill, aiManager) {
    this.name = 'generate';
    this.label = void 0;
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureGenerate;
  }
  async trigger() {
    const prompt = await this.promptInput();
    if (!prompt) return;
    const quill = this.quill;
    const selection = quill.getSelection();
    const insertIndex = selection ? selection.index : quill.getLength();
    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();
    try {
      this.aiManager.setLoading(true);
      const result = await provider.generate(prompt);
      this.aiManager.setLoading(false);
      const edited = await showReviewModal({
        title: labels.generateResultTitle,
        description: labels.generateResultDesc,
        generatedText: result
      }, labels);
      if (edited !== null) {
        quill.updateContents([{
          retain: insertIndex
        }, {
          insert: edited + '\n'
        }]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Generation failed:', error);
    }
  }
  async promptInput() {
    const labels = this.aiManager.getLabels();
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'ai-assistant-modal-overlay';
      const modal = document.createElement('div');
      modal.className = 'ai-assistant-modal';
      const title = document.createElement('h3');
      title.textContent = labels.generateModalTitle;
      const desc = document.createElement('p');
      desc.textContent = labels.generateDesc;
      const textarea = document.createElement('textarea');
      textarea.placeholder = labels.generatePlaceholder;
      const actions = document.createElement('div');
      actions.className = 'ai-assistant-modal-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'ai-assistant-btn-secondary';
      cancelBtn.textContent = labels.btnCancel;
      const submitBtn = document.createElement('button');
      submitBtn.className = 'ai-assistant-btn-primary';
      submitBtn.textContent = labels.btnGenerate;
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
      actions.appendChild(cancelBtn);
      actions.appendChild(submitBtn);
      modal.appendChild(title);
      modal.appendChild(desc);
      modal.appendChild(textarea);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      setTimeout(() => textarea.focus(), 100);
    });
  }
}