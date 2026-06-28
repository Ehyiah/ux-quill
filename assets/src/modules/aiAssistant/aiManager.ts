import type { AiOptions, AiFeature, AiProvider } from './aiTypes.js';
import { ApiProvider } from './providers/api.js';
import { TransformersProvider } from './providers/transformers.js';

type LoadingCallback = (loading: boolean) => void;

export class AiManager {
  private provider: AiProvider;
  private options: AiOptions;
  private loadingCallbacks: LoadingCallback[] = [];

  constructor(options: AiOptions) {
    this.options = options;
    this.provider = options.provider === 'api'
      ? new ApiProvider({
          models: options.models,
          debug: options.debug,
          reasoning: options.reasoning,
        })
      : new TransformersProvider();
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
