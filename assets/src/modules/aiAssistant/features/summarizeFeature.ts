import type { AiManager } from '../aiManager';
import type { AiFeature, AiFeatureInterface, SummaryFormat } from '../aiTypes';

export class SummarizeFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'summarize';
  readonly label = 'Résumer';
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getText(index: number, length: number): string; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void };
    const selection = quill.getSelection();

    let textToSummarize: string;
    let insertIndex: number;

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
      quill.updateContents([
        { retain: insertIndex },
        { insert: `${prefix}${summary}` },
      ]);
    } catch (error) {
      console.error('Summarization failed:', error);
    }
  }

  private async promptFormat(): Promise<SummaryFormat | null> {
    const options: Array<{ value: SummaryFormat; label: string }> = [
      { value: 'paragraph', label: 'Paragraphe' },
      { value: 'bullets', label: 'Points clés' },
    ];

    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'quill-ai-dropdown';
      container.style.cssText =
        'position:fixed;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;min-width:160px;';

      options.forEach((opt) => {
        const item = document.createElement('button');
        item.textContent = opt.label;
        item.style.cssText =
          'display:block;width:100%;padding:8px 16px;border:none;background:none;text-align:left;cursor:pointer;font-size:14px;';
        item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#f0f0f0'; });
        item.addEventListener('mouseleave', () => { item.style.backgroundColor = ''; });
        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(opt.value);
        });
        container.appendChild(item);
      });

      const outsideClick = (e: MouseEvent) => {
        if (!container.contains(e.target as Node)) {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(null);
        }
      };

      setTimeout(() => {
        document.addEventListener('click', outsideClick);
      }, 0);

      document.body.appendChild(container);

      const rect = window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
      if (rect) {
        container.style.top = `${rect.bottom + 4}px`;
        container.style.left = `${rect.left}px`;
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}
