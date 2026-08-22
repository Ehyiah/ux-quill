import { BaseAiProvider } from './base.js';
import type { AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SynonymResult } from '../aiTypes';
import { warnCdnFallback } from '../utils/cdnFallback.js';

const TRANSFORMERS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

type PipelineFunction = (...args: unknown[]) => Promise<unknown>;
type PipelineLoader = Promise<PipelineFunction>;

let pipelinePromise: Promise<unknown> | null = null;

async function importTransformersPipeline(): Promise<unknown> {
  let mod: { pipeline?: unknown };
  try {
    mod = await import('@huggingface/transformers');
  } catch {
    warnCdnFallback('@huggingface/transformers');
    mod = await import(TRANSFORMERS_CDN_URL);
  }

  if (typeof mod?.pipeline !== 'function') {
    throw new Error('Loaded @huggingface/transformers but the "pipeline" export is missing.');
  }

  return mod.pipeline;
}

async function getPipelineFn(): Promise<unknown> {
  if (!pipelinePromise) {
    pipelinePromise = importTransformersPipeline().catch((error: unknown) => {
      pipelinePromise = null;
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load @huggingface/transformers locally and from CDN. Install @huggingface/transformers or check network access. (${reason})`,
      );
    });
  }
  return pipelinePromise;
}

const LANGUAGE_MAP: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German',
  it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi',
};

const MODEL_MAP: Record<string, { task: string; model: string }> = {
  summarize: { task: 'summarization', model: 'Xenova/LaMini-Flan-T5-783M' },
  generate: { task: 'text-generation', model: 'Xenova/distilgpt2' },
  grammar: { task: 'text2text-generation', model: 'Xenova/LaMini-Flan-T5-783M' },
  translate: { task: 'text2text-generation', model: 'Xenova/LaMini-Flan-T5-783M' },
  rewrite: { task: 'text2text-generation', model: 'Xenova/LaMini-Flan-T5-783M' },
};

export class TransformersProvider extends BaseAiProvider {
  readonly name = 'transformers';
  readonly requiresApiKey = false;
  readonly supportedFeatures: AiFeature[] = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'toc', 'synonym'];

  private pipelines = new Map<string, PipelineFunction>();
  private loaders = new Map<string, PipelineLoader>();
  private progressListeners = new Map<AiFeature, Set<(progress: number) => void>>();
  private onProgress?: (progress: number) => void;
  private temperature: number;
  private customModel?: string;

  constructor(onProgress?: (progress: number) => void, temperature?: number, model?: string) {
    super();
    this.onProgress = onProgress;
    this.temperature = temperature ?? 0.7;
    this.customModel = model || undefined;
  }

  isAvailable(): boolean {
    return true;
  }

  /**
   * Subscribes to the download progress of the model used by `feature`.
   * Returns an unsubscribe function. Events are emitted by the underlying
   * progress_callback, no polling involved.
   */
  onModelProgress(feature: AiFeature, callback: (progress: number) => void): () => void {
    let listeners = this.progressListeners.get(feature);
    if (!listeners) {
      listeners = new Set();
      this.progressListeners.set(feature, listeners);
    }
    listeners.add(callback);

    return () => {
      this.progressListeners.get(feature)?.delete(callback);
    };
  }

  private emitModelProgress(feature: AiFeature, progress: number): void {
    this.progressListeners.get(feature)?.forEach((callback) => callback(progress));
  }

  private async getPipeline(feature: AiFeature): Promise<PipelineFunction> {
    const config = MODEL_MAP[feature];
    if (!config) {
      throw new Error(`No model configured for feature: ${feature}`);
    }

    const key = `${config.task}:${this.customModel ?? config.model}`;

    if (this.pipelines.has(key)) {
      return this.pipelines.get(key)!;
    }

    if (!this.loaders.has(key)) {
      this.onProgress?.(0);
      this.loaders.set(
        key,
        getPipelineFn().then((pipeline) =>
          (pipeline as any)(config.task, this.customModel ?? config.model, {
            progress_callback: (progress: { status: string; progress: number }) => {
              if (progress.status === 'progress_total' && typeof progress.progress === 'number') {
                const pct = Math.round(progress.progress);
                this.onProgress?.(pct);
                this.emitModelProgress(feature, pct);
              }
              if (progress.status === 'ready') {
                this.onProgress?.(100);
                this.emitModelProgress(feature, 100);
              }
            },
          })
        ) as PipelineLoader
      );
    }

    const pipe = await this.loaders.get(key)!;
    this.pipelines.set(key, pipe);
    return pipe;
  }

  async rewrite(text: string, style: RewriteStyle): Promise<string> {
    const pipe = await this.getPipeline('rewrite');

    const instructionMap: Record<RewriteStyle, string> = {
      formal: 'Rewrite the text in a formal tone.',
      casual: 'Rewrite the text in a casual tone.',
      concise: 'Rewrite the text to be more concise.',
      expanded: 'Rewrite the text with more detail.',
    };

    const prompt = `${instructionMap[style]} Output only the rewritten text:\n${text}`;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 50,
      temperature: this.temperature,
      do_sample: true,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const pipe = await this.getPipeline('translate');
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;

    const prompt = `Translate this text to ${targetName}. Output only the translation:\n${text}`;

    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 3) + 50,
      temperature: this.temperature,
      do_sample: true,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async correct(text: string): Promise<GrammarSuggestion[]> {
    const pipe = await this.getPipeline('grammar');
    const prompt = `Correct grammar mistakes. Reply in the SAME language as the input. Output ONLY the corrected text:\n${text}`;

    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 30,
      temperature: this.temperature,
      do_sample: true,
    });

    const corrected = this.extractGeneratedText(result, prompt);

    if (corrected === text || !corrected) {
      return [];
    }

    return [
      {
        original: text,
        suggestion: corrected,
        explanation: 'Grammar correction applied',
        offset: 0,
        length: text.length,
      },
    ];
  }

  async generate(prompt: string, onStream?: (chunk: string) => void): Promise<string> {
    const pipe = await this.getPipeline('generate');

    if (onStream) {
      const result = await pipe(prompt, {
        max_new_tokens: 150,
        do_sample: true,
        temperature: this.temperature,
        // @ts-expect-error - callback is valid
        callback: (token: string) => {
          onStream(token);
        },
      });

      return this.extractGeneratedText(result, prompt);
    }

    const result = await pipe(prompt, {
      max_new_tokens: 150,
      do_sample: true,
      temperature: this.temperature,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async summarize(text: string, format: SummaryFormat): Promise<string> {
    const pipe = await this.getPipeline('summarize');

    const maxLength = format === 'bullets' ? 80 : 130;
    const minLength = format === 'bullets' ? 30 : 40;
    const instruction = format === 'bullets'
      ? 'Summarize the following text as short bullet points.'
      : 'Summarize the following text briefly.';

    const result = await pipe(`${instruction}\n${text}`, {
      max_length: maxLength,
      min_length: minLength,
    });

    const summary = this.extractGeneratedText(result);

    if (format === 'bullets') {
      return summary
        .split('.')
        .filter((s) => s.trim().length > 0)
        .map((s) => `• ${s.trim()}.`)
        .join('\n');
    }

    return summary;
  }

  async findSynonyms(_word: string, _count: number): Promise<SynonymResult[]> {
    return [];
  }

  private extractGeneratedText(result: unknown, prompt?: string): string {
    if (Array.isArray(result)) {
      const first = result[0] as Record<string, unknown>;
      if (first && typeof first.summary_text === 'string') {
        return first.summary_text.trim();
      }
      if (first && typeof first.translation_text === 'string') {
        return first.translation_text.trim();
      }
      if (first && typeof first.generated_text === 'string') {
        let text = first.generated_text.trim();
        if (prompt && text.startsWith(prompt)) {
          text = text.slice(prompt.length).trim();
        }
        return text;
      }
    }
    if (typeof result === 'string') return result;
    return String(result || '');
  }
}
