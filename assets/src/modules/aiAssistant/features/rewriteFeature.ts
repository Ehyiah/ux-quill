import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, RewriteStyle } from '../aiTypes.js';
import { expandWordSelection } from '../utils/wordSelection.js';
import { showReviewModal } from '../utils/reviewModal.js';

const submenuIcon = (paths: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const REWRITE_STYLE_ICONS: Record<RewriteStyle, string> = {
  formal: submenuIcon('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>'),
  casual: submenuIcon('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
  concise: submenuIcon('<path d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z"/>'),
  expanded: submenuIcon('<path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7M4 10V4h6M4 4l7 7m3 3 6 6"/>'),
};

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
        item.type = 'button';
        item.className = 'ai-assistant-submenu-item';

        const icon = document.createElement('span');
        icon.className = `ai-assistant-submenu-icon ai-assistant-style-${s.value}`;
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = REWRITE_STYLE_ICONS[s.value];

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
        const below = refRect.bottom + 4;
        const maxY = Math.max(8, window.innerHeight - container.offsetHeight - 8);
        const y = below <= maxY ? below : Math.max(8, refRect.top - container.offsetHeight - 4);
        container.style.left = `${x}px`;
        container.style.top = `${Math.min(y, maxY)}px`;
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}
