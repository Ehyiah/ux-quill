import { BaseAiProvider } from './base.js';
import type { AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SemanticResult } from '../aiTypes.js';

const API_ENDPOINT = '/_ux/quill/ai-assistant';

interface ApiProviderOptions {
  models?: Partial<Record<AiFeature, string>>;
  debug?: boolean;
  reasoning?: boolean;
}

export class ApiProvider extends BaseAiProvider {
  readonly name = 'api';
  readonly requiresApiKey = false;
  readonly supportedFeatures: AiFeature[] = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'semantic', 'toc'];

  private options: ApiProviderOptions;

  constructor(options: ApiProviderOptions = {}) {
    super();
    this.options = options;
  }

  isAvailable(): boolean {
    return true;
  }

  private getModel(feature: AiFeature): string | undefined {
    return this.options.models?.[feature];
  }

  private async callApi(feature: string, text: string, extra: Record<string, unknown> = {}): Promise<string> {
    const payload: Record<string, unknown> = {
      feature,
      text,
      ...extra,
    };

    const model = this.getModel(feature as AiFeature);
    if (model) {
      payload.model = model;
    }

    if (this.options.debug) {
      console.log(`[AI:${feature}:request]`, { text: text.substring(0, 100), ...extra, model });
    }

    if (this.options.reasoning === false) {
      payload.reasoning = false;
    }

    const start = performance.now();

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error || `HTTP ${response.status}`;
      throw new Error(`AI API error: ${errorMsg}`);
    }

    const result = data?.result || '';

    if (this.options.debug) {
      const duration = Math.round(performance.now() - start);
      const log: Record<string, unknown> = { result, duration: `${duration}ms` };
      if (data?.usage) {
        log.usage = data.usage;
      }
      console.log(`[AI:${feature}:response]`, log);
    }

    return result;
  }

  async rewrite(text: string, style: RewriteStyle): Promise<string> {
    return this.callApi('rewrite', text, { style });
  }

  async translate(text: string, targetLang: string): Promise<string> {
    return this.callApi('translate', text, { targetLang });
  }

  async correct(text: string): Promise<GrammarSuggestion[]> {
    const result = await this.callApi('grammar', text);

    if (!result || result === text) {
      return [];
    }

    return [
      {
        original: text,
        suggestion: result,
        explanation: 'Grammar correction applied',
        offset: 0,
        length: text.length,
      },
    ];
  }

  async generate(prompt: string, _onStream?: (chunk: string) => void): Promise<string> {
    return this.callApi('generate', prompt);
  }

  async summarize(text: string, format: SummaryFormat): Promise<string> {
    const result = await this.callApi('summarize', text, { format });

    if (format === 'bullets') {
      return result
        .split('.')
        .filter((s) => s.trim().length > 0)
        .map((s) => `\u2022 ${s.trim()}.`)
        .join('\n');
    }

    return result;
  }

  async analyze(_text: string): Promise<SemanticResult> {
    const wordCount = _text.split(/\s+/).filter(Boolean).length;
    const words = _text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const frequency = new Map<string, number>();

    words.forEach((w) => {
      frequency.set(w, (frequency.get(w) || 0) + 1);
    });

    const keywords = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, freq]) => ({ word, frequency: freq }));

    const readingTime = Math.max(1, Math.round(wordCount / 200));

    return {
      keywords,
      topics: this.extractTopics(keywords),
      wordCount,
      readingTime,
    };
  }

  private extractTopics(keywords: Array<{ word: string; frequency: number }>): string[] {
    return keywords
      .filter((k) => k.frequency > 1)
      .slice(0, 5)
      .map((k) => k.word);
  }
}
