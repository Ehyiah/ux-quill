function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { ApiProvider } from "./providers/api.js";
import { TransformersProvider } from "./providers/transformers.js";
import { WllamaProvider } from "./providers/wllama.js";
export class AiManager {
  constructor(options) {
    var _options$models;
    this.provider = void 0;
    this.options = void 0;
    this.loadingCallbacks = [];
    this.downloadProgressCallbacks = [];
    this.options = options;
    switch (options.provider) {
      case 'api':
        this.provider = new ApiProvider({
          models: options.models,
          debug: options.debug,
          reasoning: options.reasoning
        });
        break;
      case 'wllama':
        this.provider = new WllamaProvider({
          model: (_options$models = options.models) == null ? void 0 : _options$models.translate,
          debug: options.debug,
          onProgress: progress => {
            this.emitDownloadProgress(progress);
          }
        });
        break;
      default:
        this.provider = new TransformersProvider(progress => {
          this.emitDownloadProgress(progress);
        });
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
  emitDownloadProgress(progress) {
    this.downloadProgressCallbacks.forEach(cb => cb(progress));
  }
  getProvider() {
    return this.provider;
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