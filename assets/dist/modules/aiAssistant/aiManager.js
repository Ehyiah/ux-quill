function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { ApiProvider } from "./providers/api.js";
export class AiManager {
  constructor(options) {
    this.provider = null;
    this.options = void 0;
    this.progressCallbacks = [];
    this.loadingCallbacks = [];
    this.options = options;
  }
  onLoadingChange(callback) {
    this.loadingCallbacks.push(callback);
  }
  setLoading(loading) {
    this.loadingCallbacks.forEach(cb => cb(loading));
  }
  async initialize() {
    const providerName = this.options.provider || 'transformers';
    switch (providerName) {
      case 'api':
        this.provider = new ApiProvider({
          models: this.options.models,
          debug: this.options.debug,
          reasoning: this.options.reasoning
        });
        break;
      case 'transformers':
        {
          const {
            TransformersProvider
          } = await import("./providers/transformers.js");
          this.provider = new TransformersProvider();
          break;
        }
      default:
        {
          const {
            TransformersProvider
          } = await import("./providers/transformers.js");
          this.provider = new TransformersProvider();
        }
    }
    this.notifyProgress({
      feature: 'rewrite',
      status: 'ready',
      progress: 100,
      message: "Provider " + this.provider.name + " initialized"
    });
  }
  getProvider() {
    if (!this.provider) {
      throw new Error('AiManager not initialized. Call initialize() first.');
    }
    return this.provider;
  }
  isFeatureSupported(feature) {
    return this.getProvider().supportedFeatures.includes(feature);
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
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }
  notifyProgress(event) {
    this.progressCallbacks.forEach(cb => cb(event));
  }
}