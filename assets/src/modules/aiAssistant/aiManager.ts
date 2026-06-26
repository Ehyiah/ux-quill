import type { AiOptions, AiFeature, AiProvider, AiProgressEvent } from './aiTypes';
import { TransformersProvider } from './providers/transformers';

type ProgressCallback = (event: AiProgressEvent) => void;

export class AiManager {
  private provider: AiProvider | null = null;
  private options: AiOptions;
  private progressCallbacks: ProgressCallback[] = [];

  constructor(options: AiOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    const providerName = this.options.provider || 'transformers';

    switch (providerName) {
      case 'transformers':
        this.provider = new TransformersProvider();
        break;
      default:
        this.provider = new TransformersProvider();
    }

    this.notifyProgress({
      feature: 'rewrite',
      status: 'ready',
      progress: 100,
      message: `Provider ${this.provider.name} initialized`,
    });
  }

  getProvider(): AiProvider {
    if (!this.provider) {
      throw new Error('AiManager not initialized. Call initialize() first.');
    }
    return this.provider;
  }

  isFeatureSupported(feature: AiFeature): boolean {
    return this.getProvider().supportedFeatures.includes(feature);
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

  onProgress(callback: ProgressCallback): void {
    this.progressCallbacks.push(callback);
  }

  private notifyProgress(event: AiProgressEvent): void {
    this.progressCallbacks.forEach((cb) => cb(event));
  }
}
