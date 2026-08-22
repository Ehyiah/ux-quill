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
        generatedText: result,
        onRegenerate: () => provider.generate(prompt)
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
      this.aiManager.reportError(error);
    }
  }
  async promptInput() {
    const labels = this.aiManager.getLabels();
    return new Promise(resolve => {
      const previouslyFocused = document.activeElement;
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
      cancelBtn.type = 'button';
      cancelBtn.className = 'ai-assistant-btn-secondary';
      cancelBtn.textContent = labels.btnCancel;
      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'ai-assistant-btn-primary';
      submitBtn.textContent = labels.btnGenerate;
      const finish = value => {
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
        previouslyFocused == null || previouslyFocused.focus();
        resolve(value);
      };
      const getFocusable = () => [textarea, cancelBtn, submitBtn];
      const onKeyDown = e => {
        if (e.key === 'Escape') {
          e.preventDefault();
          finish(null);
          return;
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          submitBtn.click();
          return;
        }
        if (e.key === 'Tab') {
          const focusable = getFocusable();
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement;
          if (e.shiftKey && (active === first || active === null)) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      cancelBtn.addEventListener('click', () => finish(null));
      submitBtn.addEventListener('click', () => {
        const value = textarea.value.trim();
        finish(value || null);
      });
      actions.appendChild(cancelBtn);
      actions.appendChild(submitBtn);
      modal.appendChild(title);
      modal.appendChild(desc);
      modal.appendChild(textarea);
      modal.appendChild(actions);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKeyDown);
      setTimeout(() => textarea.focus(), 100);
    });
  }
}