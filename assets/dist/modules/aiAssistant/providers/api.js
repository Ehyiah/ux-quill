function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { BaseAiProvider } from "./base.js";
const API_ENDPOINT = '/_ux/quill/ai-assistant';
export class ApiProvider extends BaseAiProvider {
  constructor(options) {
    if (options === void 0) {
      options = {};
    }
    super();
    this.name = 'api';
    this.requiresApiKey = false;
    this.supportedFeatures = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'semantic', 'toc'];
    this.options = void 0;
    this.options = options;
  }
  isAvailable() {
    return true;
  }
  getModel(feature) {
    var _this$options$models;
    return (_this$options$models = this.options.models) == null ? void 0 : _this$options$models[feature];
  }
  async callApi(feature, text, extra) {
    if (extra === void 0) {
      extra = {};
    }
    const payload = _extends({
      feature,
      text
    }, extra);
    const model = this.getModel(feature);
    if (model) {
      payload.model = model;
    }
    if (this.options.debug) {
      console.log("[AI:" + feature + ":request]", _extends({
        text: text.substring(0, 100)
      }, extra, {
        model
      }));
    }
    if (this.options.reasoning === false) {
      payload.reasoning = false;
    }
    const start = performance.now();
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = (data == null ? void 0 : data.error) || "HTTP " + response.status;
      throw new Error("AI API error: " + errorMsg);
    }
    const result = (data == null ? void 0 : data.result) || '';
    if (this.options.debug) {
      const duration = Math.round(performance.now() - start);
      const log = {
        result,
        duration: duration + "ms"
      };
      if (data != null && data.usage) {
        log.usage = data.usage;
      }
      console.log("[AI:" + feature + ":response]", log);
    }
    return result;
  }
  async rewrite(text, style) {
    return this.callApi('rewrite', text, {
      style
    });
  }
  async translate(text, targetLang) {
    return this.callApi('translate', text, {
      targetLang
    });
  }
  async correct(text) {
    const result = await this.callApi('grammar', text);
    if (!result || result === text) {
      return [];
    }
    return [{
      original: text,
      suggestion: result,
      explanation: 'Grammar correction applied',
      offset: 0,
      length: text.length
    }];
  }
  async generate(prompt, _onStream) {
    return this.callApi('generate', prompt);
  }
  async summarize(text, format) {
    const result = await this.callApi('summarize', text, {
      format
    });
    if (format === 'bullets') {
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