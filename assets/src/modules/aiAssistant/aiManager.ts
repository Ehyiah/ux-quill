import type { AiOptions, AiFeature, AiProvider, AiLabels } from './aiTypes.js';
import { DEFAULT_LABELS, LOCALES } from './aiTypes.js';
import { ApiProvider } from './providers/api.js';
import { TransformersProvider } from './providers/transformers.js';
import { WllamaProvider } from './providers/wllama.js';

type LoadingCallback = (loading: boolean) => void;
type DownloadProgressCallback = (progress: number) => void;

export class AiManager {
  private provider: AiProvider;
  private options: AiOptions;
  private labels: AiLabels;
  private loadingCallbacks: LoadingCallback[] = [];
  private downloadProgressCallbacks: DownloadProgressCallback[] = [];

  constructor(options: AiOptions) {
    this.options = options;
    const lang = options.ui_language || 'en';
    const baseLabels = { ...DEFAULT_LABELS, ...LOCALES[lang] };
    this.labels = { ...baseLabels, ...options.labels };

    switch (options.provider) {
      case 'api':
        this.provider = new ApiProvider({
          models: options.models,
          debug: options.debug,
          reasoning: options.reasoning,
          temperature: options.temperature,
        });
        break;
      case 'wllama':
        this.provider = new WllamaProvider({
          model: options.models?.translate,
          debug: options.debug,
          temperature: options.temperature,
          onProgress: (progress: number) => {
            this.emitDownloadProgress(progress);
          },
        });
        break;
      default:
        this.provider = new TransformersProvider((progress: number) => {
          this.emitDownloadProgress(progress);
        }, options.temperature);
        break;
    }
  }

  onLoadingChange(callback: LoadingCallback): void {
    this.loadingCallbacks.push(callback);
  }

  setLoading(loading: boolean): void {
    this.loadingCallbacks.forEach((cb) => cb(loading));
  }

  onDownloadProgress(callback: DownloadProgressCallback): void {
    this.downloadProgressCallbacks.push(callback);
  }

  private emitDownloadProgress(progress: number): void {
    this.downloadProgressCallbacks.forEach((cb) => cb(progress));
  }

  getProvider(): AiProvider {
    return this.provider;
  }

  getLabels(): AiLabels {
    return this.labels;
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
