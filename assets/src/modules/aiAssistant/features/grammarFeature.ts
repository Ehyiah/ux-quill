import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, GrammarSuggestion } from '../aiTypes.js';

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
    const quill = this.quill as { getText(): string; getSelection(): { index: number; length: number } | null; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void; on(event: string, handler: (...args: unknown[]) => void): void };
    const fullText = quill.getText().trim();
    if (!fullText) return;

    const provider = this.aiManager.getProvider();

    try {
      this.aiManager.setLoading(true);
      const suggestions = await provider.correct(fullText);

      if (suggestions.length === 0) return;

      this.applySuggestions(suggestions);
    } catch (error) {
      console.error('Grammar check failed:', error);
    } finally {
      this.aiManager.setLoading(false);
    }
  }

  private applySuggestions(suggestions: GrammarSuggestion[]): void {
    const quill = this.quill as { updateContents(delta: { ops: Array<Record<string, unknown>> }): void };

    suggestions.forEach((s) => {
      quill.updateContents([
        { retain: s.offset },
        { delete: s.length },
        { insert: s.suggestion },
      ]);
    });
  }
}
