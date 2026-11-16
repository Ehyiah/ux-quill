import { BaseAiProvider } from './base.js';
import type { AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SynonymResult } from '../aiTypes';
import { warnCdnFallback } from '../utils/cdnFallback.js';

interface WllamaModelConfig {
  repo: string;
  file: string;
}

const DEFAULT_MODEL: WllamaModelConfig = {
  repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
  file: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
};

const WLLAMA_CDN = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.0';

export function isCorruptedCacheError(error: unknown): boolean {
  if (error instanceof RangeError) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /DataView|corrupt|invalid gguf/i.test(message);
}

const LANGUAGE_MAP: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German',
  it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi',
};

export class WllamaProvider extends BaseAiProvider {
  readonly name = 'wllama';
  readonly requiresApiKey = false;
  readonly supportedFeatures: AiFeature[] = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'toc', 'synonym'];

  private wllamaInstance: any = null;
  private loadPromise: Promise<void> | null = null;
  private onProgress?: (progress: number) => void;
  private modelConfig: WllamaModelConfig;
  private debug: boolean;
  private temperature: number;

  constructor(options: { model?: string; debug?: boolean; temperature?: number; onProgress?: (progress: number) => void } = {}) {
    super();
    this.onProgress = options.onProgress;
    this.debug = options.debug ?? false;
    this.temperature = options.temperature ?? 0.7;

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

    this.loadPromise = this.loadModel().catch((error: unknown) => {
      this.loadPromise = null;
      throw error;
    });
    return this.loadPromise;
  }

  private async loadModel(): Promise<void> {
    this.onProgress?.(0);

    let wllamaModule: any;
    try {
      wllamaModule = await import('@wllama/wllama');
    } catch {
      warnCdnFallback('@wllama/wllama');
      wllamaModule = await import(/* @vite-ignore */ `${WLLAMA_CDN}/esm/index.js`);
    }

    const { Wllama } = wllamaModule;

    const recoveries: Array<'none' | 'purge' | 'wipe'> = ['none', 'purge', 'wipe'];
    let lastError: unknown;

    for (let i = 0; i < recoveries.length; i++) {
      try {
        this.wllamaInstance = await this.initInstance(Wllama, recoveries[i]);
        this.onProgress?.(100);
        return;
      } catch (error) {
        lastError = error;
        if (!isCorruptedCacheError(error)) {
          throw error;
        }
        this.debugLog(`model load failed (attempt ${i + 1}/${recoveries.length})`, error);
        this.onProgress?.(0);
      }
    }

    throw new Error(
      `Failed to load model ${this.modelConfig.repo}/${this.modelConfig.file} after ${recoveries.length} attempts`
      + ` (${lastError instanceof Error ? lastError.message : String(lastError)}).`
      + ' Clear site data for this origin and try again.',
    );
  }

  private async initInstance(WllamaClass: any, recovery: 'none' | 'purge' | 'wipe' = 'none'): Promise<any> {
    const wllama = new WllamaClass({
      default: `${WLLAMA_CDN}/src/wasm/wllama.wasm`,
    }, {
      suppressNativeLog: !this.debug,
    });

    if (recovery === 'purge') {
      await this.purgeRepoCacheEntries(wllama);
    } else if (recovery === 'wipe') {
      this.debugLog('wiping the whole model cache');
      await wllama.cacheManager.clear();
    }

    await this.purgeCorruptedCacheEntries(wllama);

    await wllama.loadModelFromHF(
      { repo: this.modelConfig.repo, file: this.modelConfig.file },
      {
        useCache: recovery === 'none',
        progressCallback: (progress: { loaded: number; total: number }) => {
          const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
          this.onProgress?.(pct);
        },
      },
    );

    return wllama;
  }

  private async purgeRepoCacheEntries(wllama: any): Promise<void> {
    try {
      const entries = await wllama.cacheManager.list();
      for (const entry of entries) {
        const url = String(entry?.metadata?.originalURL ?? '');
        if (url.includes(this.modelConfig.repo) || String(entry?.name ?? '').includes(this.modelConfig.file)) {
          await wllama.cacheManager.delete(entry.name);
        }
      }
    } catch {
      // best-effort; the wipe step covers what this cannot see
    }
  }

  private debugLog(message: string, error?: unknown): void {
    if (this.debug) {
      console.debug(`[wllama] ${message}`, error ?? '');
    }
  }

  private async purgeCorruptedCacheEntries(wllama: any): Promise<void> {
    try {
      const entries = await wllama.cacheManager.list();
      for (const entry of entries) {
        const expectedSize = Number(entry?.metadata?.originalSize ?? 0);
        if (
          expectedSize > 0
          && typeof entry?.metadata?.originalURL === 'string'
          && entry.metadata.originalURL.includes(this.modelConfig.repo)
          && Number(entry?.size ?? -1) !== expectedSize
        ) {
          await wllama.cacheManager.delete(entry.name);
        }
      }
    } catch {
      // best-effort; a corrupted cache is also recovered by the bypass retry path
    }
  }

  private async chat(
    messages: Array<{ role: string; content: string }>,
    options: { max_tokens?: number; temperature?: number } = {},
  ): Promise<string> {
    await this.ensureLoaded();

    let result: any;
    try {
      result = await this.wllamaInstance.createChatCompletion({
        messages,
        max_tokens: options.max_tokens ?? 256,
        temperature: options.temperature ?? this.temperature,
        chat_template_kwargs: { add_generation_prompt: true },
      });
    } catch (error) {
      // A crashed WASM context is unusable: force a clean model reload on next use.
      this.wllamaInstance = null;
      this.loadPromise = null;
      if (isCorruptedCacheError(error)) {
        throw new Error(
          `Wllama inference failed (${error instanceof Error ? error.message : String(error)}).`
          + ' The model will be reloaded from scratch on next use.',
        );
      }
      throw error;
    }

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
      { role: 'system', content: `You rewrite text in a ${styleDesc[style]} tone. Respond with ONLY the rewritten text, no explanations, no quotes.` },
      { role: 'user', content: `Input: ${text}\nOutput:` },
    ]);
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;

    return this.chat([
      { role: 'system', content: 'You are a professional translator. Detect the source language automatically. Respond with ONLY the translation, no explanations or notes.' },
      { role: 'user', content: `Translate the following text to ${targetName}.\n\nInput: ${text}\nOutput:` },
    ], { temperature: 0.1 });
  }

  async correct(text: string): Promise<GrammarSuggestion[]> {
    const result = await this.chat([
      { role: 'system', content: 'You are a grammar corrector. Always reply in the SAME language as the input text. Reply with ONLY the corrected text — no explanations, no quotes.' },
      { role: 'user', content: `Text: ${text}\nCorrected:` },
    ], { temperature: 0.1 });

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
      { role: 'system', content: 'You are a helpful writing assistant. Respond with ONLY the requested content, no explanations and no greetings.' },
      { role: 'user', content: prompt },
    ], { max_tokens: 200 });
  }

  async summarize(text: string, format: SummaryFormat): Promise<string> {
    const instruction = format === 'bullets'
      ? 'Summarize as bullet points.'
      : 'Summarize concisely.';

    const result = await this.chat([
      { role: 'system', content: `You are a summarizer. ${instruction} Respond with ONLY the summary, no preamble.` },
      { role: 'user', content: `Input: ${text}\nOutput:` },
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

  async findSynonyms(word: string, count: number): Promise<SynonymResult[]> {
    const result = await this.chat([
      { role: 'system', content: 'You are a lexicography assistant. Respond with ONLY a RAW JSON array of objects in format [{"word": "...", "score": 0.0-1.0}], sorted by relevance. No markdown fences, no explanations.' },
      { role: 'user', content: `Find up to ${count} synonyms for the word "${word}". Detect the language automatically. Reply with the JSON array only.` },
    ], { max_tokens: 300, temperature: 0.3 });

    try {
      const cleaned = result.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item: unknown) => {
        if (typeof item === 'string') {
          return { word: item };
        }
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return {
            word: String(obj.word || obj[0] || ''),
            score: typeof obj.score === 'number' ? obj.score : undefined,
          };
        }
        return { word: '' };
      }).filter((s: SynonymResult) => s.word.length > 0);
    } catch {
      return [];
    }
  }
}
