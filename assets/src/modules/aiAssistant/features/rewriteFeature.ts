import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, RewriteStyle } from '../aiTypes.js';
import { expandWordSelection } from '../utils/wordSelection.js';

export class RewriteFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'rewrite';
  readonly label = 'Reformuler';
  readonly requiresSelection = true;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getText(index?: number, length?: number): string; updateContents(delta: { ops: Array<Record<string, unknown>> }): void; getLength(): number };
    const selection = quill.getSelection();

    if (!selection || selection.length === 0) {
      return;
    }

    const fullText = quill.getText();
    const wordRange = expandWordSelection(fullText, selection.index, selection.length);
    const selectedText = quill.getText(wordRange.index, wordRange.length).trim();
    if (!selectedText) return;

    const style = await this.promptStyle();
    if (!style) return;

    const provider = this.aiManager.getProvider();

    try {
      this.aiManager.setLoading(true);
      const rewritten = await provider.rewrite(selectedText, style);

      quill.updateContents([
        { retain: wordRange.index },
        { delete: wordRange.length },
        { insert: rewritten },
      ]);
    } catch (error) {
      console.error('Rewrite failed:', error);
    } finally {
      this.aiManager.setLoading(false);
    }
  }

  private async promptStyle(): Promise<RewriteStyle | null> {
    const styles: Array<{ value: RewriteStyle; label: string; desc: string }> = [
      { value: 'formal', label: 'Formel', desc: 'Ton professionnel et soutenu' },
      { value: 'casual', label: 'D\u00E9contract\u00E9', desc: 'Ton naturel et d\u00E9tendu' },
      { value: 'concise', label: 'Plus concis', desc: 'Aller droit au but' },
      { value: 'expanded', label: 'Plus d\u00E9velopp\u00E9', desc: 'Ajouter des d\u00E9tails et des nuances' },
    ];

    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';

      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = 'Style de r\u00E9\u00E9criture';
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
        icon.textContent = iconMap[s.value] || '\u2728';
        icon.style.cssText = 'flex-shrink:0;width:24px;text-align:center;font-size:16px;';

        const text = document.createElement('span');
        text.style.cssText = 'flex:1;min-width:0;';
        text.innerHTML = `<div style="font-size:13px;font-weight:500;">${s.label}</div><div style="font-size:11px;color:#888;">${s.desc}</div>`;

        item.appendChild(icon);
        item.appendChild(text);

        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(s.value);
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
