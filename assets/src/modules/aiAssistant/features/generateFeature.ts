import type { AiManager } from '../aiManager';
import type { AiFeature, AiFeatureInterface } from '../aiTypes';

export class GenerateFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'generate';
  readonly label = 'Générer du contenu';
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
  }

  async trigger(): Promise<void> {
    const prompt = await this.promptInput();
    if (!prompt) return;

    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void; getText(): string };
    const selection = quill.getSelection();
    const insertIndex = selection ? selection.index : quill.getLength();
    const provider = this.aiManager.getProvider();

    const loadingText = '...';
    quill.updateContents([
      { retain: insertIndex },
      { insert: loadingText },
    ]);

    try {
      let accumulated = '';

      await provider.generate(prompt, (chunk: string) => {
        accumulated += chunk;

        quill.updateContents([
          { retain: insertIndex },
          { delete: loadingText.length },
          { insert: accumulated },
        ]);
      });

      quill.updateContents([
        { retain: insertIndex },
        { delete: loadingText.length },
        { insert: accumulated },
      ]);
    } catch (error) {
      console.error('Generation failed:', error);

      quill.updateContents([
        { retain: insertIndex },
        { delete: loadingText.length },
        { insert: '[Generation failed]' },
      ]);
    }
  }

  private async promptInput(): Promise<string | null> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'ai-assistant-modal-overlay';

      const modal = document.createElement('div');
      modal.className = 'ai-assistant-modal';

      const title = document.createElement('h3');
      title.textContent = 'G\u00E9n\u00E9rer du contenu';

      const desc = document.createElement('p');
      desc.textContent = 'D\u00E9crivez ce que vous voulez g\u00E9n\u00E9rer, puis appuyez sur G\u00E9n\u00E9rer.';

      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Exemple : \u00C9cris un paragraphe sur les avantages du t\u00E9l\u00E9travail...';

      const actions = document.createElement('div');
      actions.className = 'ai-assistant-modal-actions';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'ai-assistant-btn-secondary';
      cancelBtn.textContent = 'Annuler';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'ai-assistant-btn-primary';
      submitBtn.textContent = 'G\u00E9n\u00E9rer';

      cancelBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(null);
      });

      textarea.addEventListener('keydown', (e) => {
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
