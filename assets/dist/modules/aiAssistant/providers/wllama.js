function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { BaseAiProvider } from "./base.js";
const DEFAULT_MODEL = {
  repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
  file: 'qwen2.5-0.5b-instruct-q4_k_m.gguf'
};
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
export class WllamaProvider extends BaseAiProvider {
  constructor(options) {
    var _options$debug;
    if (options === void 0) {
      options = {};
    }
    super();
    this.name = 'wllama';
    this.requiresApiKey = false;
    this.supportedFeatures = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'semantic', 'toc'];
    this.wllamaInstance = null;
    this.loadPromise = null;
    this.onProgress = void 0;
    this.modelConfig = void 0;
    this.debug = void 0;
    this.onProgress = options.onProgress;
    this.debug = (_options$debug = options.debug) != null ? _options$debug : false;
    if (options.model) {
      const parts = options.model.split('/');
      if (parts.length >= 2) {
        this.modelConfig = {
          repo: parts.slice(0, -1).join('/'),
          file: parts[parts.length - 1]
        };
      } else {
        this.modelConfig = _extends({}, DEFAULT_MODEL, {
          file: options.model
        });
      }
    } else {
      this.modelConfig = _extends({}, DEFAULT_MODEL);
    }
  }
  isAvailable() {
    return true;
  }
  async ensureLoaded() {
    if (this.wllamaInstance) return;
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = this.loadModel();
    return this.loadPromise;
  }
  async loadModel() {
    var _this$onProgress, _this$onProgress3;
    (_this$onProgress = this.onProgress) == null || _this$onProgress.call(this, 0);
    let wllamaModule;
    try {
      wllamaModule = await import('@wllama/wllama');
    } catch (_unused) {
      wllamaModule = await import('https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/esm/index.js');
    }
    const {
      Wllama
    } = wllamaModule;
    const wasmAssetsPath = {
      default: 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.5.1/src/wasm/wllama.wasm'
    };
    const wllama = new Wllama(wasmAssetsPath);
    await wllama.loadModelFromHF({
      repo: this.modelConfig.repo,
      file: this.modelConfig.file
    }, {
      progressCallback: progress => {
        var _this$onProgress2;
        const pct = progress.total > 0 ? Math.round(progress.loaded / progress.total * 100) : 0;
        (_this$onProgress2 = this.onProgress) == null || _this$onProgress2.call(this, pct);
      }
    });
    this.wllamaInstance = wllama;
    (_this$onProgress3 = this.onProgress) == null || _this$onProgress3.call(this, 100);
  }
  async chat(messages, options) {
    var _options$max_tokens, _options$temperature, _result$choices;
    if (options === void 0) {
      options = {};
    }
    await this.ensureLoaded();
    const result = await this.wllamaInstance.createChatCompletion({
      messages,
      max_tokens: (_options$max_tokens = options.max_tokens) != null ? _options$max_tokens : 256,
      temperature: (_options$temperature = options.temperature) != null ? _options$temperature : 0.7
    });
    const content = (result == null || (_result$choices = result.choices) == null || (_result$choices = _result$choices[0]) == null || (_result$choices = _result$choices.message) == null ? void 0 : _result$choices.content) || '';
    return content.trim();
  }
  async rewrite(text, style) {
    const styleDesc = {
      formal: 'formal',
      casual: 'casual',
      concise: 'concise',
      expanded: 'detailed'
    };
    return this.chat([{
      role: 'system',
      content: "You rewrite text in a " + styleDesc[style] + " tone."
    }, {
      role: 'user',
      content: "Rewrite this:\n" + text
    }], {
      temperature: 0.3
    });
  }
  async translate(text, targetLang) {
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;
    return this.chat([{
      role: 'system',
      content: 'You are a translator.'
    }, {
      role: 'user',
      content: "Translate to " + targetName + ":\n" + text
    }], {
      temperature: 0.3
    });
  }
  async correct(text) {
    const result = await this.chat([{
      role: 'system',
      content: 'You correct grammar.'
    }, {
      role: 'user',
      content: "Correct the grammar:\n" + text
    }], {
      temperature: 0.2
    });
    if (!result || result === text) return [];
    return [{
      original: text,
      suggestion: result,
      explanation: 'Grammar correction applied',
      offset: 0,
      length: text.length
    }];
  }
  async generate(prompt, _onStream) {
    return this.chat([{
      role: 'system',
      content: 'You are a helpful writing assistant.'
    }, {
      role: 'user',
      content: prompt
    }], {
      temperature: 0.7,
      max_tokens: 200
    });
  }
  async summarize(text, format) {
    const instruction = format === 'bullets' ? 'Summarize as bullet points:' : 'Summarize concisely:';
    const result = await this.chat([{
      role: 'system',
      content: 'You are a summarizer.'
    }, {
      role: 'user',
      content: instruction + "\n" + text
    }], {
      temperature: 0.3
    });
    if (format === 'bullets' && !result.startsWith('\u2022') && !result.startsWith('-')) {
      return result.split('.').filter(s => s.trim().length > 0).map(s => "\u2022 " + s.trim() + ".").join('\n');
    }
    return result;
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
}