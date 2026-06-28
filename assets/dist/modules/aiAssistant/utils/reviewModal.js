export function showReviewModal(options) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'ai-assistant-modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'ai-assistant-modal';
    const title = document.createElement('h3');
    title.textContent = options.title;
    const desc = document.createElement('p');
    desc.textContent = options.description;
    modal.appendChild(title);
    modal.appendChild(desc);
    if (options.originalText !== undefined) {
      const originalBlock = document.createElement('div');
      originalBlock.className = 'ai-assistant-review-original';
      originalBlock.textContent = options.originalText;
      modal.appendChild(originalBlock);
    }
    const textarea = document.createElement('textarea');
    textarea.value = options.generatedText;
    modal.appendChild(textarea);
    const actions = document.createElement('div');
    actions.className = 'ai-assistant-modal-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ai-assistant-btn-secondary';
    cancelBtn.textContent = 'Annuler';
    const applyBtn = document.createElement('button');
    applyBtn.className = 'ai-assistant-btn-primary';
    applyBtn.textContent = 'Appliquer';
    const cleanup = () => {
      overlay.remove();
    };
    const apply = () => {
      cleanup();
      resolve(textarea.value);
    };
    const cancel = () => {
      cleanup();
      resolve(null);
    };
    cancelBtn.addEventListener('click', cancel);
    applyBtn.addEventListener('click', apply);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        cancel();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        apply();
      }
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        cancel();
      }
    });
    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    setTimeout(() => textarea.focus(), 100);
  });
}