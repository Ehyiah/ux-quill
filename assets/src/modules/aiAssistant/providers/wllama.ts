import { BaseAiProvider } from './base.js';
import type { AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SemanticResult } from '../aiTypes';

interface WllamaModelConfig {
  repo: string;
  file: string;
}

const DEFAULT_MODEL: WllamaModelConfig = {
  repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
  file: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
};

const LANGUAGE_MAP: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German',
  it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi',
};

export class WllamaProvider extends BaseAiProvider {
  readonly name = 'wllama';
  readonly requiresApiKey = false;
  readonly supportedFeatures: AiFeature[] = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'semantic', 'toc'];

  private wllamaInstance: any = null;
  private loadPromise: Promise<void> | null = null;
  private onProgress?: (progress: number) => void;
  private modelConfig: WllamaModelConfig;
  private debug: boolean;

  constructor(options: { model?: string; debug?: boolean; onProgress?: (progress: number) => void } = {}) {
    super();
    this.onProgress = options.onProgress;
    this.debug = options.debug ?? false;

    if (options.model) {
      const parts = options.model.split('/');
      if (parts.length >= 2) {
        this.modelConfig = {
          repo: parts.slice(0, -1).join('/'),
          file: parts[parts.length - 1],
        };
      } else {
        this.modelConfig = { ...DEFAULT_MODEL, file: options.model };
      }
    } else {
      this.modelConfig = { ...DEFAULT_MODEL };
    }
  }

  isAvailable(): boolean {
    return true;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.wllamaInstance) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loadModel();
    return this.loadPromise;
  }

  private async loadModel(): Promise<void> {
    this.onProgress?.(0);

    let wllamaModule: any;
    try {
      wllamaModule = await import('@wllama/wllama');
    } catch {
      wllamaModule = await import(
        'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/esm/index.js'
      );
    }

    const { Wllama } = wllamaModule;

    const wasmAssetsPath = {
      default: 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/src/wasm/wllama.wasm',
    };
    const wllama = new Wllama(wasmAssetsPath);

    await wllama.loadModelFromHF(
      { repo: this.modelConfig.repo, file: this.modelConfig.file },
      {
        progressCallback: (progress: { loaded: number; total: number }) => {
          const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
          this.onProgress?.(pct);
        },
      },
    );

    this.wllamaInstance = wllama;
    this.onProgress?.(100);
  }

  private async chat(
    messages: Array<{ role: string; content: string }>,
    options: { max_tokens?: number; temperature?: number } = {},
  ): Promise<string> {
    await this.ensureLoaded();

    const result = await this.wllamaInstance.createChatCompletion({
      messages,
      max_tokens: options.max_tokens ?? 256,
      temperature: options.temperature ?? 0.7,
    });

    const content = result?.choices?.[0]?.message?.content || '';
    return content.trim();
  }

  async rewrite(text: string, style: RewriteStyle): Promise<string> {
    const styleDesc: Record<RewriteStyle, string> = {
      formal: 'formal',
      casual: 'casual',
      concise: 'concise',
      expanded: 'detailed',
    };

    return this.chat([
      { role: 'system', content: `You rewrite text in a ${styleDesc[style]} tone.` },
      { role: 'user', content: `Rewrite this:\n${text}` },
    ], { temperature: 0.3 });
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;

    return this.chat([
      { role: 'system', content: 'You are a professional translator. Respond with ONLY the translation, no explanations or notes.' },
      { role: 'user', content: `Translate the following text to ${targetName}. Detect the source language automatically:\n${text}` },
    ], { temperature: 0.3 });
  }

  async correct(text: string): Promise<GrammarSuggestion[]> {
    const result = await this.chat([
      { role: 'system', content: 'You are a grammar expert. Correct all grammatical errors. Preserve the original meaning and style. Respond with ONLY the corrected text, no explanations.' },
      { role: 'user', content: `Correct the grammatical errors in the following text. Detect the language and preserve it:\n${text}` },
    ], { temperature: 0.2 });

    if (!result || result === text) return [];

    return [{
      original: text,
      suggestion: result,
      explanation: 'Grammar correction applied',
      offset: 0,
      length: text.length,
    }];
  }

  async generate(prompt: string, _onStream?: (chunk: string) => void): Promise<string> {
    return this.chat([
      { role: 'system', content: 'You are a helpful writing assistant.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.7, max_tokens: 200 });
  }

  async summarize(text: string, format: SummaryFormat): Promise<string> {
    const instruction = format === 'bullets'
      ? 'Summarize as bullet points:'
      : 'Summarize concisely:';

    const result = await this.chat([
      { role: 'system', content: 'You are a summarizer.' },
      { role: 'user', content: `${instruction}\n${text}` },
    ], { temperature: 0.3 });

    if (format === 'bullets' && !result.startsWith('\u2022') && !result.startsWith('-')) {
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
