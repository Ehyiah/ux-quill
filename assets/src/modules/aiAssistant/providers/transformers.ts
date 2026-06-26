import { pipeline } from '@xenova/transformers';
import { BaseAiProvider } from './base';
import type { AiFeature, RewriteStyle, SummaryFormat, GrammarSuggestion, SemanticResult } from '../aiTypes';

type PipelineFunction = (...args: unknown[]) => Promise<unknown>;
type PipelineLoader = Promise<PipelineFunction>;

const LANGUAGE_MAP: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German',
  it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  ar: 'Arabic', hi: 'Hindi',
};

const MODEL_MAP: Record<string, { task: string; model: string }> = {
  summarize: { task: 'summarization', model: 'Xenova/t5-small' },
  generate: { task: 'text-generation', model: 'Xenova/distilgpt2' },
  grammar: { task: 'text2text-generation', model: 'Xenova/t5-small' },
  translate: { task: 'text2text-generation', model: 'Xenova/t5-small' },
  rewrite: { task: 'text2text-generation', model: 'Xenova/t5-small' },
};

export class TransformersProvider extends BaseAiProvider {
  readonly name = 'transformers';
  readonly requiresApiKey = false;
  readonly supportedFeatures: AiFeature[] = ['rewrite', 'translate', 'grammar', 'generate', 'summarize'];

  private pipelines = new Map<string, PipelineFunction>();
  private loaders = new Map<string, PipelineLoader>();
  private modelProgress = new Map<string, number>();

  isAvailable(): boolean {
    return typeof pipeline === 'function';
  }

  onModelProgress(feature: AiFeature, callback: (progress: number) => void): void {
    const key = MODEL_MAP[feature]?.model || feature;
    this.modelProgress.set(key, 0);
    const originalCallback = callback;

    const interval = setInterval(() => {
      const current = this.modelProgress.get(key) || 0;
      originalCallback(current);
      if (current >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }

  private async getPipeline(feature: AiFeature): Promise<PipelineFunction> {
    const config = MODEL_MAP[feature];
    if (!config) {
      throw new Error(`No model configured for feature: ${feature}`);
    }

    const key = `${config.task}:${config.model}`;

    if (this.pipelines.has(key)) {
      return this.pipelines.get(key)!;
    }

    if (!this.loaders.has(key)) {
      this.loaders.set(
        key,
        pipeline(config.task, config.model, {
          // @ts-expect-error - progress_callback is valid in @xenova/transformers
          progress_callback: (progress: { status: string; progress: number }) => {
            if (progress.status === 'progress' && typeof progress.progress === 'number') {
              this.modelProgress.set(key, Math.round(progress.progress * 100));
            }
            if (progress.status === 'done') {
              this.modelProgress.set(key, 100);
            }
          },
        }) as PipelineLoader
      );
    }

    const pipe = await this.loaders.get(key)!;
    this.pipelines.set(key, pipe);
    return pipe;
  }

  async rewrite(text: string, style: RewriteStyle): Promise<string> {
    const pipe = await this.getPipeline('rewrite');

    const prefixMap: Record<RewriteStyle, string> = {
      formal: 'formal:',
      casual: 'casual:',
      concise: 'concise:',
      expanded: 'expanded:',
    };

    const prompt = `${prefixMap[style]} ${text}`;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 1.5) + 20,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const pipe = await this.getPipeline('translate');
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;
    // il faudra permettre de custom la langue d'origine !!!!
    const prompt = `translate English to ${targetName}: ${text}`;

    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 20,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async correct(text: string): Promise<GrammarSuggestion[]> {
    const pipe = await this.getPipeline('grammar');
    const prompt = `grammar: ${text}`;

    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 1.3) + 10,
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
        temperature: 0.7,
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
      temperature: 0.7,
    });

    return this.extractGeneratedText(result, prompt);
  }

  async summarize(text: string, format: SummaryFormat): Promise<string> {
    const pipe = await this.getPipeline('summarize');

    const maxLength = format === 'bullets' ? 80 : 130;
    const minLength = format === 'bullets' ? 30 : 40;

    const result = await pipe(text, {
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
