import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, RewriteStyle } from '../aiTypes.js';
import { expandWordSelection } from '../utils/wordSelection.js';
import { showReviewModal } from '../utils/reviewModal.js';

export class RewriteFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'rewrite';
  readonly label: string;
  readonly requiresSelection = true;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureRewrite;
  }

  async trigger(anchorRect?: DOMRect): Promise<void> {
    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getText(index?: number, length?: number): string; updateContents(delta: { ops: Array<Record<string, unknown>> }): void; getLength(): number };
    const selection = quill.getSelection();

    if (!selection || selection.length === 0) {
      return;
    }

    const getChar = (i: number) => {
      if (i < 0 || i >= quill.getLength()) return '';
      return quill.getText(i, 1) || '';
    };
    const wordRange = expandWordSelection(getChar, selection.index, selection.length);
    const selectedText = quill.getText(wordRange.index, wordRange.length).trim();
    if (!selectedText) return;

    const style = await this.promptStyle(anchorRect);
    if (!style) return;

    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();

    try {
      this.aiManager.setLoading(true);
      const rewritten = await provider.rewrite(selectedText, style);
      this.aiManager.setLoading(false);

      const edited = await showReviewModal({
        title: labels.featureRewrite,
        description: labels.rewriteStyleLabel.replace('{style}', style),
        originalText: selectedText,
        generatedText: rewritten,
        onRegenerate: () => provider.rewrite(selectedText, style),
      }, labels);

      if (edited !== null) {
        quill.updateContents([
          { retain: wordRange.index },
          { delete: wordRange.length },
          { insert: edited },
        ]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      this.aiManager.reportError(error);
    }
  }

  private async promptStyle(anchorRect?: DOMRect): Promise<RewriteStyle | null> {
    const labels = this.aiManager.getLabels();
    const styles: Array<{ value: RewriteStyle; label: string; desc: string }> = [
      { value: 'formal', label: labels.rewriteFormal, desc: labels.rewriteFormalDesc },
      { value: 'casual', label: labels.rewriteCasual, desc: labels.rewriteCasualDesc },
      { value: 'concise', label: labels.rewriteConcise, desc: labels.rewriteConciseDesc },
      { value: 'expanded', label: labels.rewriteExpanded, desc: labels.rewriteExpandedDesc },
    ];

    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';

      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = labels.rewriteStyleTitle;
      container.appendChild(title);

      styles.forEach((s) => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';

        const iconMap: Record<string, string> = {
          formal: '\uD83D\uDCDB',
          casual: '\uD83D\uDE0A',
          concise: '\u26A1',
          expanded: '\uD83D\uDCD0',
        };

        const icon = document.createElement('span');
        icon.className = 'ai-assistant-submenu-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = iconMap[s.value] || '\u2728';

        const copy = document.createElement('span');
        copy.className = 'ai-assistant-submenu-copy';
        const labelEl = document.createElement('span');
        labelEl.className = 'ai-assistant-submenu-label';
        labelEl.textContent = s.label;
        const descEl = document.createElement('span');
        descEl.className = 'ai-assistant-submenu-description';
        descEl.textContent = s.desc;
        copy.appendChild(labelEl);
        copy.appendChild(descEl);

        item.appendChild(icon);
        item.appendChild(copy);

        item.addEventListener('click', () => {
          finish(s.value);
        });
        container.appendChild(item);
      });

      const outsideClick = (e: MouseEvent) => {
        if (!container.contains(e.target as Node)) {
          finish(null);
        }
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          finish(null);
        }
      };
      const finish = (value: RewriteStyle | null) => {
        document.removeEventListener('click', outsideClick);
        document.removeEventListener('keydown', onKeyDown);
        container.remove();
        resolve(value);
      };

      setTimeout(() => {
        document.addEventListener('click', outsideClick);
        document.addEventListener('keydown', onKeyDown);
      }, 0);

      document.body.appendChild(container);

      const refRect = anchorRect || window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
      if (refRect) {
        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(refRect.left, maxX));
        container.style.left = `${x}px`;
        container.style.top = `${refRect.bottom + 4}px`;
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}
