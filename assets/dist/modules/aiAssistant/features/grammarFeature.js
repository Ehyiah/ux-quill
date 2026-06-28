import { showReviewModal } from "../utils/reviewModal.js";
export class GrammarFeature {
  constructor(quill, aiManager) {
    this.name = 'grammar';
    this.label = 'Corriger la grammaire';
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
  }
  async trigger() {
    const quill = this.quill;
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
        correctedText = correctedText.substring(0, s.offset) + s.suggestion + correctedText.substring(s.offset + s.length);
      }
      if (correctedText === fullText) return;
      const edited = await showReviewModal({
        title: 'Correction grammaticale',
        description: 'Texte corrigé automatiquement',
        originalText: fullText,
        generatedText: correctedText
      });
      if (edited !== null) {
        quill.updateContents([{
          retain: 0
        }, {
          delete: quill.getLength() - 1
        }, {
          insert: edited
        }]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Grammar check failed:', error);
    }
  }
}