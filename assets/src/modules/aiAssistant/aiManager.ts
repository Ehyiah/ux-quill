import type { AiOptions, AiFeature, AiProvider } from './aiTypes.js';
import { ApiProvider } from './providers/api.js';

type LoadingCallback = (loading: boolean) => void;

export class AiManager {
  private provider: AiProvider;
  private options: AiOptions;
  private loadingCallbacks: LoadingCallback[] = [];

  constructor(options: AiOptions) {
    this.options = options;
    this.provider = new ApiProvider({
      models: options.models,
      debug: options.debug,
      reasoning: options.reasoning,
    });
  }

  onLoadingChange(callback: LoadingCallback): void {
    this.loadingCallbacks.push(callback);
  }

  setLoading(loading: boolean): void {
    this.loadingCallbacks.forEach((cb) => cb(loading));
  }

  getProvider(): AiProvider {
    return this.provider;
  }

  isFeatureSupported(feature: AiFeature): boolean {
    return this.provider.supportedFeatures.includes(feature);
  }

  isFeatureEnabled(feature: AiFeature): boolean {
    const features = this.options.features || {};
    const value = features[feature];
    return value === true || (typeof value === 'object' && value !== null);
  }

  getFeatureConfig(feature: AiFeature): Record<string, unknown> {
    const features = this.options.features || {};
    const value = features[feature];
    if (typeof value === 'object' && value !== null) {
      return { ...value } as Record<string, unknown>;
    }
    return {};
  }
}
