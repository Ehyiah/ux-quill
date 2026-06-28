function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import { ApiProvider } from "./providers/api.js";
export class AiManager {
  constructor(options) {
    this.provider = void 0;
    this.options = void 0;
    this.loadingCallbacks = [];
    this.options = options;
    this.provider = new ApiProvider({
      models: options.models,
      debug: options.debug,
      reasoning: options.reasoning
    });
  }
  onLoadingChange(callback) {
    this.loadingCallbacks.push(callback);
  }
  setLoading(loading) {
    this.loadingCallbacks.forEach(cb => cb(loading));
  }
  getProvider() {
    return this.provider;
  }
  isFeatureSupported(feature) {
    return this.provider.supportedFeatures.includes(feature);
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