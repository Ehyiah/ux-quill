export type AiFeature =
  | 'rewrite'
  | 'translate'
  | 'grammar'
  | 'generate'
  | 'summarize'
  | 'semantic'
  | 'toc';

export type RewriteStyle = 'formal' | 'casual' | 'concise' | 'expanded';

export type SummaryFormat = 'paragraph' | 'bullets';

export interface GrammarSuggestion {
  original: string;
  suggestion: string;
  explanation?: string;
  offset: number;
  length: number;
}

export interface SemanticResult {
  keywords: Array<{ word: string; frequency: number }>;
  topics: string[];
  wordCount: number;
  readingTime: number;
}

export type AiProviderType = 'api' | 'transformers' | 'wllama';

export interface AiOptions {
  provider?: AiProviderType;
  api_key?: string | null;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
  models?: Partial<Record<AiFeature, string>>;
  debug?: boolean;
  reasoning?: boolean;
  translate?: {
    target_languages?: string[];
    default_language?: string;
  };
  toc?: {
    depth?: number;
  };
}

export interface AiProgressEvent {
  feature: AiFeature;
  status: 'loading' | 'ready' | 'error';
  progress: number;
  message?: string;
}

export interface AiProvider {
  readonly name: string;
  readonly requiresApiKey: boolean;
  readonly supportedFeatures: AiFeature[];

  isAvailable(): boolean;
  rewrite(text: string, style: RewriteStyle): Promise<string>;
  translate(text: string, targetLang: string): Promise<string>;
  correct(text: string): Promise<GrammarSuggestion[]>;
  generate(prompt: string, onStream?: (chunk: string) => void): Promise<string>;
  summarize(text: string, format: SummaryFormat): Promise<string>;
  analyze(text: string): Promise<SemanticResult>;
}

export interface AiFeatureInterface {
  readonly name: AiFeature;
  readonly label: string;
  readonly requiresSelection: boolean;

  trigger(): Promise<void>;
}
