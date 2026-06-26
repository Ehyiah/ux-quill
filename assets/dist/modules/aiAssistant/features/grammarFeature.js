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
      const suggestions = await provider.correct(fullText);
      if (suggestions.length === 0) return;
      this.applySuggestions(suggestions);
    } catch (error) {
      console.error('Grammar check failed:', error);
    }
  }
  applySuggestions(suggestions) {
    const quill = this.quill;
    suggestions.forEach(s => {
      quill.updateContents([{
        retain: s.offset
      }, {
        delete: s.length
      }, {
        insert: s.suggestion
      }]);
    });
  }
}