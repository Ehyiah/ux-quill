function _tsRewriteRelativeImportExtensions(t, e) { return "string" == typeof t && /^\.\.?\//.test(t) ? t.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+)?)\.([cm]?)ts$/i, function (t, s, r, n, o) { return s ? e ? ".jsx" : ".js" : !r || n && o ? r + n + "." + o.toLowerCase() + "js" : t; }) : t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { BaseAiProvider } from "./base.js";
import { warnCdnFallback } from "../utils/cdnFallback.js";
const DEFAULT_MODEL = {
  repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
  file: 'qwen2.5-0.5b-instruct-q4_k_m.gguf'
};
const WLLAMA_CDN = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.0';
export function isCorruptedCacheError(error) {
  if (error instanceof RangeError) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error != null ? error : '');
  return /DataView|corrupt|invalid gguf/i.test(message);
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
    this.loadPromise = this.loadModel().catch(error => {
      this.loadPromise = null;
      throw error;
    });
    return this.loadPromise;
  }
  async loadModel() {
    var _this$onProgress;
    (_this$onProgress = this.onProgress) == null || _this$onProgress.call(this, 0);
    let wllamaModule;
    try {
      wllamaModule = await import('@wllama/wllama');
    } catch (_unused) {
      warnCdnFallback('@wllama/wllama');
      wllamaModule = await import(/* @vite-ignore */_tsRewriteRelativeImportExtensions(WLLAMA_CDN + "/esm/index.js"));
    }
    const {
      Wllama
    } = wllamaModule;
    const recoveries = ['none', 'purge', 'wipe'];
    let lastError;
    for (let i = 0; i < recoveries.length; i++) {
      try {
        var _this$onProgress2;
        this.wllamaInstance = await this.initInstance(Wllama, recoveries[i]);
        (_this$onProgress2 = this.onProgress) == null || _this$onProgress2.call(this, 100);
        return;
      } catch (error) {
        var _this$onProgress3;
        lastError = error;
        if (!isCorruptedCacheError(error)) {
          throw error;
        }
        this.debugLog("model load failed (attempt " + (i + 1) + "/" + recoveries.length + ")", error);
        (_this$onProgress3 = this.onProgress) == null || _this$onProgress3.call(this, 0);
      }
    }
    throw new Error("Failed to load model " + this.modelConfig.repo + "/" + this.modelConfig.file + " after " + recoveries.length + " attempts" + (" (" + (lastError instanceof Error ? lastError.message : String(lastError)) + ").") + ' Clear site data for this origin and try again.');
  }
  async initInstance(WllamaClass, recovery) {
    if (recovery === void 0) {
      recovery = 'none';
    }
    const wllama = new WllamaClass({
      default: WLLAMA_CDN + "/src/wasm/wllama.wasm"
    }, {
      suppressNativeLog: !this.debug
    });
    if (recovery === 'purge') {
      await this.purgeRepoCacheEntries(wllama);
    } else if (recovery === 'wipe') {
      this.debugLog('wiping the whole model cache');
      await wllama.cacheManager.clear();
    }
    await this.purgeCorruptedCacheEntries(wllama);
    await wllama.loadModelFromHF({
      repo: this.modelConfig.repo,
      file: this.modelConfig.file
    }, {
      useCache: recovery === 'none',
      progressCallback: progress => {
        var _this$onProgress4;
        const pct = progress.total > 0 ? Math.round(progress.loaded / progress.total * 100) : 0;
        (_this$onProgress4 = this.onProgress) == null || _this$onProgress4.call(this, pct);
      }
    });
    return wllama;
  }
  async purgeRepoCacheEntries(wllama) {
    try {
      const entries = await wllama.cacheManager.list();
      for (const entry of entries) {
        var _entry$metadata$origi, _entry$metadata, _entry$name;
        const url = String((_entry$metadata$origi = entry == null || (_entry$metadata = entry.metadata) == null ? void 0 : _entry$metadata.originalURL) != null ? _entry$metadata$origi : '');
        if (url.includes(this.modelConfig.repo) || String((_entry$name = entry == null ? void 0 : entry.name) != null ? _entry$name : '').includes(this.modelConfig.file)) {
          await wllama.cacheManager.delete(entry.name);
        }
      }
    } catch (_unused2) {
      // best-effort; the wipe step covers what this cannot see
    }
  }
  debugLog(message, error) {
    if (this.debug) {
      console.debug("[wllama] " + message, error != null ? error : '');
    }
  }
  async purgeCorruptedCacheEntries(wllama) {
    try {
      const entries = await wllama.cacheManager.list();
      for (const entry of entries) {
        var _entry$metadata$origi2, _entry$metadata2, _entry$metadata3, _entry$size;
        const expectedSize = Number((_entry$metadata$origi2 = entry == null || (_entry$metadata2 = entry.metadata) == null ? void 0 : _entry$metadata2.originalSize) != null ? _entry$metadata$origi2 : 0);
        if (expectedSize > 0 && typeof (entry == null || (_entry$metadata3 = entry.metadata) == null ? void 0 : _entry$metadata3.originalURL) === 'string' && entry.metadata.originalURL.includes(this.modelConfig.repo) && Number((_entry$size = entry == null ? void 0 : entry.size) != null ? _entry$size : -1) !== expectedSize) {
          await wllama.cacheManager.delete(entry.name);
        }
      }
    } catch (_unused3) {
      // best-effort; a corrupted cache is also recovered by the bypass retry path
    }
  }
  async chat(messages, options) {
    var _result;
    if (options === void 0) {
      options = {};
    }
    await this.ensureLoaded();
    let result;
    try {
      var _options$max_tokens, _options$temperature2;
      result = await this.wllamaInstance.createChatCompletion({
        messages,
        max_tokens: (_options$max_tokens = options.max_tokens) != null ? _options$max_tokens : 256,
        temperature: (_options$temperature2 = options.temperature) != null ? _options$temperature2 : this.temperature,
        chat_template_kwargs: {
          add_generation_prompt: true
        }
      });
    } catch (error) {
      // A crashed WASM context is unusable: force a clean model reload on next use.
      this.wllamaInstance = null;
      this.loadPromise = null;
      if (isCorruptedCacheError(error)) {
        throw new Error("Wllama inference failed (" + (error instanceof Error ? error.message : String(error)) + ")." + ' The model will be reloaded from scratch on next use.');
      }
      throw error;
    }
    const content = ((_result = result) == null || (_result = _result.choices) == null || (_result = _result[0]) == null || (_result = _result.message) == null ? void 0 : _result.content) || '';
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
    } catch (_unused4) {
      return [];
    }
  }
}