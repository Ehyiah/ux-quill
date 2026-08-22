function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { BaseAiProvider } from "./base.js";
import { warnCdnFallback } from "../utils/cdnFallback.js";
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
    var _options$debug, _options$temperature;
    if (options === void 0) {
      options = {};
    }
    super();
    this.name = 'wllama';
    this.requiresApiKey = false;
    this.supportedFeatures = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'toc', 'synonym'];
    this.wllamaInstance = null;
    this.loadPromise = null;
    this.onProgress = void 0;
    this.modelConfig = void 0;
    this.debug = void 0;
    this.temperature = void 0;
    this.onProgress = options.onProgress;
    this.debug = (_options$debug = options.debug) != null ? _options$debug : false;
    this.temperature = (_options$temperature = options.temperature) != null ? _options$temperature : 0.7;
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
      warnCdnFallback('@wllama/wllama');
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
    var _options$max_tokens, _options$temperature2, _result$choices;
    if (options === void 0) {
      options = {};
    }
    await this.ensureLoaded();
    const result = await this.wllamaInstance.createChatCompletion({
      messages,
      max_tokens: (_options$max_tokens = options.max_tokens) != null ? _options$max_tokens : 256,
      temperature: (_options$temperature2 = options.temperature) != null ? _options$temperature2 : this.temperature,
      chat_template_kwargs: {
        add_generation_prompt: true
      }
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
      content: "You rewrite text in a " + styleDesc[style] + " tone. Respond with ONLY the rewritten text, no explanations, no quotes."
    }, {
      role: 'user',
      content: "Input: " + text + "\nOutput:"
    }]);
  }
  async translate(text, targetLang) {
    const targetName = LANGUAGE_MAP[targetLang] || targetLang;
    return this.chat([{
      role: 'system',
      content: 'You are a professional translator. Detect the source language automatically. Respond with ONLY the translation, no explanations or notes.'
    }, {
      role: 'user',
      content: "Translate the following text to " + targetName + ".\n\nInput: " + text + "\nOutput:"
    }], {
      temperature: 0.1
    });
  }
  async correct(text) {
    const result = await this.chat([{
      role: 'system',
      content: 'You are a grammar corrector. Always reply in the SAME language as the input text. Reply with ONLY the corrected text — no explanations, no quotes.'
    }, {
      role: 'user',
      content: "Text: " + text + "\nCorrected:"
    }], {
      temperature: 0.1
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
      content: 'You are a helpful writing assistant. Respond with ONLY the requested content, no explanations and no greetings.'
    }, {
      role: 'user',
      content: prompt
    }], {
      max_tokens: 200
    });
  }
  async summarize(text, format) {
    const instruction = format === 'bullets' ? 'Summarize as bullet points.' : 'Summarize concisely.';
    const result = await this.chat([{
      role: 'system',
      content: "You are a summarizer. " + instruction + " Respond with ONLY the summary, no preamble."
    }, {
      role: 'user',
      content: "Input: " + text + "\nOutput:"
    }], {
      temperature: 0.3
    });
    if (format === 'bullets' && !result.startsWith('\u2022') && !result.startsWith('-')) {
      return result.split('.').filter(s => s.trim().length > 0).map(s => "\u2022 " + s.trim() + ".").join('\n');
    }
    return result;
  }
  async findSynonyms(word, count) {
    const result = await this.chat([{
      role: 'system',
      content: 'You are a lexicography assistant. Respond with ONLY a RAW JSON array of objects in format [{"word": "...", "score": 0.0-1.0}], sorted by relevance. No markdown fences, no explanations.'
    }, {
      role: 'user',
      content: "Find up to " + count + " synonyms for the word \"" + word + "\". Detect the language automatically. Reply with the JSON array only."
    }], {
      max_tokens: 300,
      temperature: 0.3
    });
    try {
      const cleaned = result.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(item => {
        if (typeof item === 'string') {
          return {
            word: item
          };
        }
        if (typeof item === 'object' && item !== null) {
          const obj = item;
          return {
            word: String(obj.word || obj[0] || ''),
            score: typeof obj.score === 'number' ? obj.score : undefined
          };
        }
        return {
          word: ''
        };
      }).filter(s => s.word.length > 0);
    } catch (_unused2) {
      return [];
    }
  }
}