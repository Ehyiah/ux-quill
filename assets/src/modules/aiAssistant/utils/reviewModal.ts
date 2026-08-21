import type { AiLabels } from '../aiTypes.js';
import { DEFAULT_LABELS } from '../aiTypes.js';

export function showReviewModal(options: {
  title: string;
  description: string;
  originalText?: string;
  generatedText: string;
  onRegenerate?: () => Promise<string>;
}, labels?: AiLabels): Promise<string | null> {
  const l = labels || DEFAULT_LABELS;
  return new Promise((resolve, reject) => {
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
    cancelBtn.textContent = l.btnCancel;

    const applyBtn = document.createElement('button');
    applyBtn.className = 'ai-assistant-btn-primary';
    applyBtn.textContent = l.btnApply;

    let regenerateBtn: HTMLButtonElement | null = null;
    if (options.onRegenerate) {
      regenerateBtn = document.createElement('button');
      regenerateBtn.className = 'ai-assistant-btn-secondary ai-assistant-btn-regenerate';
      regenerateBtn.textContent = `\u21BB ${l.btnRegenerate}`;
    }

    const busy = { value: false };

    const cleanup = () => {
      overlay.remove();
    };

    const apply = () => {
      if (busy.value) return;
      cleanup();
      resolve(textarea.value);
    };

    const cancel = () => {
      cleanup();
      resolve(null);
    };

    const setBusy = (value: boolean): void => {
      busy.value = value;
      textarea.readOnly = value;
      overlay.classList.toggle('ai-assistant-modal-busy', value);
      for (const btn of [regenerateBtn, cancelBtn, applyBtn]) {
        if (btn) {
          btn.disabled = value;
        }
      }
    };

    const regenerate = async (): Promise<void> => {
      if (!options.onRegenerate || !regenerateBtn || busy.value) return;

      setBusy(true);
      regenerateBtn.classList.add('ai-assistant-btn-loading');
      try {
        textarea.value = await options.onRegenerate();
        textarea.scrollTop = textarea.scrollHeight;
      } catch (error) {
        cleanup();
        reject(error);
      } finally {
        regenerateBtn.classList.remove('ai-assistant-btn-loading');
        setBusy(false);
      }
    };

    cancelBtn.addEventListener('click', cancel);
    applyBtn.addEventListener('click', apply);
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        void regenerate();
      });
    }

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cancel();
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        apply();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cancel();
      }
    });

    if (regenerateBtn) {
      actions.appendChild(regenerateBtn);
    }
    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => textarea.focus(), 100);
  });
}
