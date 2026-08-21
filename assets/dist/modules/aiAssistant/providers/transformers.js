function _tsRewriteRelativeImportExtensions(t, e) { return "string" == typeof t && /^\.\.?\//.test(t) ? t.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+)?)\.([cm]?)ts$/i, function (t, s, r, n, o) { return s ? e ? ".jsx" : ".js" : !r || n && o ? r + n + "." + o.toLowerCase() + "js" : t; }) : t; }
import { BaseAiProvider } from "./base.js";
import { warnCdnFallback } from "../utils/cdnFallback.js";
const TRANSFORMERS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
let pipelinePromise = null;
async function importTransformersPipeline() {
  var _mod;
  let mod;
  try {
    mod = await import('@huggingface/transformers');
  } catch (_unused) {
    warnCdnFallback('@huggingface/transformers');
    mod = await import(_tsRewriteRelativeImportExtensions(TRANSFORMERS_CDN_URL));
  }
  if (typeof ((_mod = mod) == null ? void 0 : _mod.pipeline) !== 'function') {
    throw new Error('Loaded @huggingface/transformers but the "pipeline" export is missing.');
  }
  return mod.pipeline;
}
async function getPipelineFn() {
  if (!pipelinePromise) {
    pipelinePromise = importTransformersPipeline().catch(error => {
      pipelinePromise = null;
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error("Failed to load @huggingface/transformers locally and from CDN. Install @huggingface/transformers or check network access. (" + reason + ")");
    });
  }
  return pipelinePromise;
}
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
    model: 'Xenova/LaMini-Flan-T5-783M'
  },
  generate: {
    task: 'text-generation',
    model: 'Xenova/distilgpt2'
  },
  grammar: {
    task: 'text2text-generation',
    model: 'Xenova/LaMini-Flan-T5-783M'
  },
  translate: {
    task: 'text2text-generation',
    model: 'Xenova/LaMini-Flan-T5-783M'
  },
  rewrite: {
    task: 'text2text-generation',
    model: 'Xenova/LaMini-Flan-T5-783M'
  }
};
export class TransformersProvider extends BaseAiProvider {
  constructor(onProgress, temperature) {
    super();
    this.name = 'transformers';
    this.requiresApiKey = false;
    this.supportedFeatures = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'toc', 'synonym'];
    this.pipelines = new Map();
    this.loaders = new Map();
    this.modelProgress = new Map();
    this.onProgress = void 0;
    this.temperature = void 0;
    this.onProgress = onProgress;
    this.temperature = temperature != null ? temperature : 0.7;
  }
  isAvailable() {
    return true;
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
      var _this$onProgress;
      (_this$onProgress = this.onProgress) == null || _this$onProgress.call(this, 0);
      this.loaders.set(key, getPipelineFn().then(pipeline => pipeline(config.task, config.model, {
        progress_callback: progress => {
          if (progress.status === 'progress_total' && typeof progress.progress === 'number') {
            var _this$onProgress2;
            const pct = Math.round(progress.progress);
            this.modelProgress.set(key, pct);
            (_this$onProgress2 = this.onProgress) == null || _this$onProgress2.call(this, pct);
          }
          if (progress.status === 'ready') {
            var _this$onProgress3;
            this.modelProgress.set(key, 100);
            (_this$onProgress3 = this.onProgress) == null || _this$onProgress3.call(this, 100);
          }
        }
      })));
    }
    const pipe = await this.loaders.get(key);
    this.pipelines.set(key, pipe);
    return pipe;
  }
  async rewrite(text, style) {
    const pipe = await this.getPipeline('rewrite');
    const prefixMap = {
      formal: 'Please rewrite the following text in a formal tone:\n',
      casual: 'Please rewrite the following text in a casual tone:\n',
      concise: 'Please rewrite the following text to be more concise:\n',
      expanded: 'Please rewrite the following text to be more detailed:\n'
    };
    const prompt = "" + prefixMap[style] + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 50,
      temperature: this.temperature,
      do_sample: true
    });
    return this.extractGeneratedText(result, prompt);
  }
  async translate(text, targetLang) {
    const pipe = await this.getPipeline('translate');
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;
    const prompt = "Translate the following text to " + targetName + ":\n" + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 3) + 50,
      temperature: this.temperature,
      do_sample: true
    });
    return this.extractGeneratedText(result, prompt);
  }
  async correct(text) {
    const pipe = await this.getPipeline('grammar');
    const prompt = "Correct the grammatical errors in the following text. Detect the language and preserve it:\n" + text;
    const result = await pipe(prompt, {
      max_new_tokens: Math.round(text.split(' ').length * 2) + 30,
      temperature: this.temperature,
      do_sample: true
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
        temperature: this.temperature,
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
      temperature: this.temperature
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
  async findSynonyms(_word, _count) {
    return [];
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