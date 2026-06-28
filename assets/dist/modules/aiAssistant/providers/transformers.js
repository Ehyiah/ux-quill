import { pipeline } from '@huggingface/transformers';
import { BaseAiProvider } from "./base.js";
const LANGUAGE_MAP = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi'
};
const MODEL_MAP = {
  summarize: {
    task: 'summarization',
    model: 'Xenova/t5-small'
  },
  generate: {
    task: 'text-generation',
    model: 'Xenova/distilgpt2'
  },
  grammar: {
    task: 'text2text-generation',
    model: 'Xenova/t5-small'
  },
  translate: {
    task: 'text2text-generation',
    model: 'Xenova/t5-small'
  },
  rewrite: {
    task: 'text2text-generation',
    model: 'Xenova/t5-small'
  }
};
export class TransformersProvider extends BaseAiProvider {
  constructor() {
    super(...arguments);
    this.name = 'transformers';
    this.requiresApiKey = false;
    this.supportedFeatures = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'semantic', 'toc'];
    this.pipelines = new Map();
    this.loaders = new Map();
    this.modelProgress = new Map();
  }
  isAvailable() {
    return typeof pipeline === 'function';
  }
  onModelProgress(feature, callback) {
    var _MODEL_MAP$feature;
    const key = ((_MODEL_MAP$feature = MODEL_MAP[feature]) == null ? void 0 : _MODEL_MAP$feature.model) || feature;
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
  async getPipeline(feature) {
    const config = MODEL_MAP[feature];
    if (!config) {
      throw new Error("No model configured for feature: " + feature);
    }
    const key = config.task + ":" + config.model;
    if (this.pipelines.has(key)) {
      return this.pipelines.get(key);
    }
    if (!this.loaders.has(key)) {
      this.loaders.set(key, pipeline(config.task, config.model, {
        // @ts-expect-error - progress_callback is valid in @huggingface/transformers
        progress_callback: progress => {
          if (progress.status === 'progress' && typeof progress.progress === 'number') {
            this.modelProgress.set(key, Math.round(progress.progress * 100));
          }
          if (progress.status === 'done') {
            this.modelProgress.set(key, 100);
          }
        }
      }));
    }
    const pipe = await this.loaders.get(key);
    this.pipelines.set(key, pipe);
    return pipe;
  }
  async rewrite(text, style) {
    const pipe = await this.getPipeline('rewrite');
    const prefixMap = {
      formal: 'formal:',
      casual: 'casual:',
      concise: 'concise:',
      expanded: 'expanded:'
    };
    const prompt = prefixMap[style] + " " + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 1.5) + 20
    });
    return this.extractGeneratedText(result, prompt);
  }
  async translate(text, targetLang) {
    const pipe = await this.getPipeline('translate');
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;
    // il faudra permettre de custom la langue d'origine !!!!
    const prompt = "translate English to " + targetName + ": " + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 20
    });
    return this.extractGeneratedText(result, prompt);
  }
  async correct(text) {
    const pipe = await this.getPipeline('grammar');
    const prompt = "grammar: " + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 1.3) + 10
    });
    const corrected = this.extractGeneratedText(result, prompt);
    if (corrected === text || !corrected) {
      return [];
    }
    return [{
      original: text,
      suggestion: corrected,
      explanation: 'Grammar correction applied',
      offset: 0,
      length: text.length
    }];
  }
  async generate(prompt, onStream) {
    const pipe = await this.getPipeline('generate');
    if (onStream) {
      const result = await pipe(prompt, {
        max_new_tokens: 150,
        do_sample: true,
        temperature: 0.7,
        // @ts-expect-error - callback is valid
        callback: token => {
          onStream(token);
        }
      });
      return this.extractGeneratedText(result, prompt);
    }
    const result = await pipe(prompt, {
      max_new_tokens: 150,
      do_sample: true,
      temperature: 0.7
    });
    return this.extractGeneratedText(result, prompt);
  }
  async summarize(text, format) {
    const pipe = await this.getPipeline('summarize');
    const maxLength = format === 'bullets' ? 80 : 130;
    const minLength = format === 'bullets' ? 30 : 40;
    const result = await pipe(text, {
      max_length: maxLength,
      min_length: minLength
    });
    const summary = this.extractGeneratedText(result);
    if (format === 'bullets') {
      return summary.split('.').filter(s => s.trim().length > 0).map(s => "\u2022 " + s.trim() + ".").join('\n');
    }
    return summary;
  }
  async analyze(_text) {
    const wordCount = _text.split(/\s+/).filter(Boolean).length;
    const words = _text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const frequency = new Map();
    words.forEach(w => {
      frequency.set(w, (frequency.get(w) || 0) + 1);
    });
    const keywords = Array.from(frequency.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20).map(_ref => {
      let [word, freq] = _ref;
      return {
        word,
        frequency: freq
      };
    });
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    return {
      keywords,
      topics: this.extractTopics(keywords),
      wordCount,
      readingTime
    };
  }
  extractTopics(keywords) {
    return keywords.filter(k => k.frequency > 1).slice(0, 5).map(k => k.word);
  }
  extractGeneratedText(result, prompt) {
    if (Array.isArray(result)) {
      const first = result[0];
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