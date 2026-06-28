import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, SummaryFormat } from '../aiTypes.js';
import { expandWordSelection } from '../utils/wordSelection.js';
import { showReviewModal } from '../utils/reviewModal.js';

export class SummarizeFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'summarize';
  readonly label: string;
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureSummarize;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getText(index: number, length: number): string; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void };
    const selection = quill.getSelection();

    let textToSummarize: string;
    let insertIndex: number;

    if (selection && selection.length > 0) {
      const fullText = quill.getText();
      const wordRange = expandWordSelection(fullText, selection.index, selection.length);
      textToSummarize = quill.getText(wordRange.index, wordRange.length).trim();
      insertIndex = wordRange.index + wordRange.length;
    } else {
      textToSummarize = quill.getText().trim();
      insertIndex = quill.getLength();
    }

    if (!textToSummarize) return;

    const format = await this.promptFormat();
    if (!format) return;

    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();

    try {
      this.aiManager.setLoading(true);
      const summary = await provider.summarize(textToSummarize, format);
      this.aiManager.setLoading(false);

      const edited = await showReviewModal({
        title: labels.summarizeResultTitle,
        description: format === 'bullets' ? labels.summarizeResultBullets : labels.summarizeResultParagraph,
        originalText: textToSummarize,
        generatedText: summary,
      }, labels);

      if (edited !== null) {
        const prefix = format === 'bullets' ? labels.summarizePrefix : labels.summarizePrefix;
        quill.updateContents([
          { retain: insertIndex },
          { insert: `${prefix}${edited}` },
        ]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Summarization failed:', error);
    }
  }

  private async promptFormat(): Promise<SummaryFormat | null> {
    const labels = this.aiManager.getLabels();
    const options: Array<{ value: SummaryFormat; label: string; desc: string; icon: string }> = [
      { value: 'paragraph', label: labels.summarizeParagraph, desc: labels.summarizeParagraphDesc, icon: '\uD83D\uDCDD' },
      { value: 'bullets', label: labels.summarizeBullets, desc: labels.summarizeBulletsDesc, icon: '\uD83D\uDCCC' },
    ];

    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';

      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = labels.summarizeFormatTitle;
      container.appendChild(title);

      options.forEach((opt) => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';

        const icon = document.createElement('span');
        icon.textContent = opt.icon;
        icon.style.cssText = 'flex-shrink:0;width:24px;text-align:center;font-size:16px;';

        const text = document.createElement('span');
        text.style.cssText = 'flex:1;min-width:0;';
        text.innerHTML = `<div style="font-size:13px;font-weight:500;">${opt.label}</div><div style="font-size:11px;color:#888;">${opt.desc}</div>`;

        item.appendChild(icon);
        item.appendChild(text);

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
        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(rect.left, maxX));
        container.style.left = `${x}px`;
        container.style.top = `${rect.bottom + 4}px`;
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}
