import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface } from '../aiTypes.js';
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
    const quill = this.quill as { getText(): string; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void };
    const fullText = quill.getText().trim();
    if (!fullText) return;

    const provider = this.aiManager.getProvider();

    try {
      this.aiManager.setLoading(true);
      const suggestions = await provider.correct(fullText);
      this.aiManager.setLoading(false);

      if (suggestions.length === 0) return;

      let correctedText = fullText;
      for (const s of suggestions) {
        correctedText =
          correctedText.substring(0, s.offset) + s.suggestion +
          correctedText.substring(s.offset + s.length);
      }

      if (correctedText === fullText) return;

      const edited = await showReviewModal({
        title: 'Correction grammaticale',
        description: 'Texte corrigé automatiquement',
        originalText: fullText,
        generatedText: correctedText,
      });

      if (edited !== null) {
        quill.updateContents([
          { retain: 0 },
          { delete: quill.getLength() - 1 },
          { insert: edited },
        ]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Grammar check failed:', error);
    }
  }
}
