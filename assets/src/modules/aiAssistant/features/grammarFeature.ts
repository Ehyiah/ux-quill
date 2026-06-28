import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface } from '../aiTypes.js';
import { expandWordSelection } from '../utils/wordSelection.js';
import { showReviewModal } from '../utils/reviewModal.js';

export class GrammarFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'grammar';
  readonly label = 'Corriger la grammaire';
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;

  constructor(quill: unknown, aiManager: AiManager) {
    this.quill = quill;
    this.aiManager = aiManager;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as {
      getSelection(): { index: number; length: number } | null;
      getText(index?: number, length?: number): string;
      getLength(): number;
      updateContents(delta: { ops: Array<Record<string, unknown>> }): void;
    };
    const selection = quill.getSelection();
    const useSelection = selection && selection.length > 0;

    let text: string;
    let replaceIndex: number;
    let replaceLength: number;

    if (useSelection) {
      const fullText = quill.getText();
      const wordRange = expandWordSelection(fullText, selection.index, selection.length);
      text = quill.getText(wordRange.index, wordRange.length).trim();
      replaceIndex = wordRange.index;
      replaceLength = wordRange.length;
    } else {
      text = quill.getText().trim();
      replaceIndex = 0;
      replaceLength = quill.getLength() - 1;
    }
    if (!text) return;

    const provider = this.aiManager.getProvider();

    try {
      this.aiManager.setLoading(true);
      const suggestions = await provider.correct(text);
      this.aiManager.setLoading(false);

      if (suggestions.length === 0) return;

      let correctedText = text;
      for (const s of suggestions) {
        correctedText =
          correctedText.substring(0, s.offset) + s.suggestion +
          correctedText.substring(s.offset + s.length);
      }

      if (correctedText === text) return;

      const edited = await showReviewModal({
        title: 'Correction grammaticale',
        description: 'Texte corrigé automatiquement',
        originalText: text,
        generatedText: correctedText,
      });

      if (edited !== null) {
        quill.updateContents([
          { retain: replaceIndex },
          { delete: replaceLength },
          { insert: edited },
        ]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Grammar check failed:', error);
    }
  }
}
