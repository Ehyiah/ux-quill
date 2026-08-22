function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { DEFAULT_LABELS, LOCALES } from "./aiTypes.js";
import { ApiProvider } from "./providers/api.js";
import { TransformersProvider } from "./providers/transformers.js";
import { WllamaProvider } from "./providers/wllama.js";
export class AiManager {
  constructor(options) {
    this.provider = void 0;
    this.options = void 0;
    this.labels = void 0;
    this.loadingCallbacks = [];
    this.downloadProgressCallbacks = [];
    this.errorCallbacks = [];
    this.options = options;
    const lang = options.ui_language || 'en';
    const baseLabels = _extends({}, DEFAULT_LABELS, LOCALES[lang]);
    this.labels = _extends({}, baseLabels, options.labels);
    switch (options.provider) {
      case 'api':
        this.provider = new ApiProvider({
          debug: options.debug
        });
        break;
      case 'wllama':
        this.provider = new WllamaProvider({
          model: options.model,
          debug: options.debug,
          temperature: options.temperature,
          onProgress: progress => {
            this.emitDownloadProgress(progress);
          }
        });
        break;
      default:
        this.provider = new TransformersProvider(progress => {
          this.emitDownloadProgress(progress);
        }, options.temperature, options.model);
        break;
    }
  }
  onLoadingChange(callback) {
    this.loadingCallbacks.push(callback);
  }
  setLoading(loading) {
    this.loadingCallbacks.forEach(cb => cb(loading));
  }
  onDownloadProgress(callback) {
    this.downloadProgressCallbacks.push(callback);
  }

  /**
   * Forwards per-feature model download progress when the provider supports
   * it (TransformersProvider). Returns an unsubscribe function, or undefined
   * when the active provider has no per-feature progress.
   */
  onModelProgress(feature, callback) {
    const capable = this.provider;
    return capable.onModelProgress == null ? void 0 : capable.onModelProgress(feature, callback);
  }
  onError(callback) {
    this.errorCallbacks.push(callback);
  }
  reportError(error) {
    const normalizedError = error instanceof Error ? error : new Error('The AI request failed.');
    if (this.options.debug) {
      console.error('AI request failed:', normalizedError);
    }
    this.errorCallbacks.forEach(callback => callback(normalizedError));
  }
  emitDownloadProgress(progress) {
    this.downloadProgressCallbacks.forEach(cb => cb(progress));
  }
  getProvider() {
    return this.provider;
  }
  getLabels() {
    return this.labels;
  }
  isFeatureEnabled(feature) {
    const features = this.options.features || {};
    const value = features[feature];
    return value === true || typeof value === 'object' && value !== null;
  }
  getFeatureConfig(feature) {
    const features = this.options.features || {};
    const value = features[feature];
    if (typeof value === 'object' && value !== null) {
      return _extends({}, value);
    }
    return {};
  }
}