import type { AiProvider, AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SemanticResult } from '../aiTypes.js';

export abstract class BaseAiProvider implements AiProvider {
  abstract readonly name: string;
  abstract readonly requiresApiKey: boolean;
  abstract readonly supportedFeatures: AiFeature[];

  abstract isAvailable(): boolean;
  abstract rewrite(text: string, style: RewriteStyle): Promise<string>;
  abstract translate(text: string, targetLang: string): Promise<string>;
  abstract correct(text: string): Promise<GrammarSuggestion[]>;
  abstract generate(prompt: string, onStream?: (chunk: string) => void): Promise<string>;
  abstract summarize(text: string, format: SummaryFormat): Promise<string>;
  abstract analyze(text: string): Promise<SemanticResult>;
}
