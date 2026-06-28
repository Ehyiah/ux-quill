import { showReviewModal } from "../utils/reviewModal.js";
export class GrammarFeature {
  constructor(quill, aiManager) {
    this.name = 'grammar';
    this.label = void 0;
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureGrammar;
  }
  async trigger() {
    const quill = this.quill;
    const selection = quill.getSelection();
    const useSelection = selection && selection.length > 0;
    let text;
    let replaceIndex;
    let replaceLength;
    if (useSelection) {
      const fullText = quill.getText();
      const {
        expandWordSelection
      } = await import("../utils/wordSelection.js");
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
    const labels = this.aiManager.getLabels();
    try {
      this.aiManager.setLoading(true);
      const suggestions = await provider.correct(text);
      this.aiManager.setLoading(false);
      if (suggestions.length === 0) return;
      let correctedText = text;
      for (const s of suggestions) {
        correctedText = correctedText.substring(0, s.offset) + s.suggestion + correctedText.substring(s.offset + s.length);
      }
      if (correctedText === text) return;
      const edited = await showReviewModal({
        title: labels.featureGrammar,
        description: labels.grammarDescription,
        originalText: text,
        generatedText: correctedText
      }, labels);
      if (edited !== null) {
        quill.updateContents([{
          retain: replaceIndex
        }, {
          delete: replaceLength
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