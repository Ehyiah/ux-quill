import type { AiOptions, AiFeature, AiProvider, AiLabels } from './aiTypes.js';
import { DEFAULT_LABELS, LOCALES } from './aiTypes.js';
import { ApiProvider } from './providers/api.js';
import { TransformersProvider } from './providers/transformers.js';
import { WllamaProvider } from './providers/wllama.js';

type LoadingCallback = (loading: boolean) => void;
type DownloadProgressCallback = (progress: number) => void;
type ErrorCallback = (error: Error) => void;

export class AiManager {
  private provider: AiProvider;
  private options: AiOptions;
  private labels: AiLabels;
  private loadingCallbacks: LoadingCallback[] = [];
  private downloadProgressCallbacks: DownloadProgressCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  constructor(options: AiOptions) {
    this.options = options;
    const lang = options.ui_language || 'en';
    const baseLabels = { ...DEFAULT_LABELS, ...LOCALES[lang] };
    this.labels = { ...baseLabels, ...options.labels };

    switch (options.provider) {
        case 'api':
          this.provider = new ApiProvider({
          debug: options.debug,
        });
        break;
      case 'wllama':
        this.provider = new WllamaProvider({
          model: options.model,
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
        }, options.temperature, options.model);
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

  /**
   * Forwards per-feature model download progress when the provider supports
   * it (TransformersProvider). Returns an unsubscribe function, or undefined
   * when the active provider has no per-feature progress.
   */
  onModelProgress(feature: AiFeature, callback: (progress: number) => void): (() => void) | undefined {
    const capable = this.provider as Partial<{
      onModelProgress: (feature: AiFeature, callback: (progress: number) => void) => () => void;
    }>;

    return capable.onModelProgress?.(feature, callback);
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  reportError(error: unknown): void {
    const normalizedError = error instanceof Error ? error : new Error('The AI request failed.');
    if (this.options.debug) {
      console.error('AI request failed:', normalizedError);
    }
    this.errorCallbacks.forEach((callback) => callback(normalizedError));
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
