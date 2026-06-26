import type { AiManager } from '../aiManager';
import type { AiFeature, AiFeatureInterface } from '../aiTypes';

export class TranslateFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'translate';
  readonly label = 'Traduire';
  readonly requiresSelection = true;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as { getSelection(): { index: number; length: number } | null; getText(index: number, length: number): string; updateContents(delta: { ops: Array<Record<string, unknown>> }): void };
    const selection = quill.getSelection();

    if (!selection || selection.length === 0) {
      return;
    }

    const selectedText = quill.getText(selection.index, selection.length).trim();
    if (!selectedText) return;

    const targetLang = await this.promptLanguage();
    if (!targetLang) return;

    const provider = this.aiManager.getProvider();

    try {
      const translated = await provider.translate(selectedText, targetLang);

      quill.updateContents([
        { retain: selection.index },
        { delete: selection.length },
        { insert: translated },
      ]);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  }

  private async promptLanguage(): Promise<string | null> {
    const languages = [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'de', label: 'Deutsch' },
      { code: 'it', label: 'Italiano' },
      { code: 'pt', label: 'Português' },
      { code: 'nl', label: 'Nederlands' },
      { code: 'pl', label: 'Polski' },
      { code: 'ru', label: 'Русский' },
      { code: 'zh', label: '中文' },
      { code: 'ja', label: '日本語' },
      { code: 'ko', label: '한국어' },
      { code: 'ar', label: 'العربية' },
      { code: 'hi', label: 'हिन्दी' },
    ];

    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'quill-ai-dropdown';
      container.style.cssText =
        'position:fixed;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;min-width:200px;max-height:300px;overflow-y:auto;';

      languages.forEach((lang) => {
        const item = document.createElement('button');
        item.textContent = lang.label;
        item.style.cssText =
          'display:block;width:100%;padding:8px 16px;border:none;background:none;text-align:left;cursor:pointer;font-size:14px;';
        item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#f0f0f0'; });
        item.addEventListener('mouseleave', () => { item.style.backgroundColor = ''; });
        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(lang.code);
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
