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

export interface AiLabels {
  featureRewrite: string;
  featureTranslate: string;
  featureGrammar: string;
  featureGenerate: string;
  featureSummarize: string;
  featureSemantic: string;
  featureToc: string;

  descRewrite: string;
  descTranslate: string;
  descGrammar: string;
  descGenerate: string;
  descSummarize: string;
  descSemantic: string;
  descToc: string;

  rewriteStyleTitle: string;
  rewriteFormal: string;
  rewriteFormalDesc: string;
  rewriteCasual: string;
  rewriteCasualDesc: string;
  rewriteConcise: string;
  rewriteConciseDesc: string;
  rewriteExpanded: string;
  rewriteExpandedDesc: string;
  rewriteStyleLabel: string;

  translateTargetTitle: string;

  grammarDescription: string;

  generateTitle: string;
  generateDesc: string;
  generatePlaceholder: string;
  generateModalTitle: string;
  generateResultTitle: string;
  generateResultDesc: string;

  summarizeTitle: string;
  summarizeFormatTitle: string;
  summarizeParagraph: string;
  summarizeParagraphDesc: string;
  summarizeBullets: string;
  summarizeBulletsDesc: string;
  summarizeResultTitle: string;
  summarizeResultBullets: string;
  summarizeResultParagraph: string;
  summarizePrefix: string;

  semanticTitle: string;
  semanticStats: string;
  semanticWords: string;
  semanticReadingTime: string;
  semanticTopics: string;
  semanticKeywordsCount: string;
  semanticKeywordsTitle: string;

  btnApply: string;
  btnCancel: string;
  btnClose: string;
  btnGenerate: string;
  loadingModel: string;
  preparing: string;
}

export const DEFAULT_LABELS: AiLabels = {
  featureRewrite: 'Reformulate',
  featureTranslate: 'Translate',
  featureGrammar: 'Correct grammar',
  featureGenerate: 'Generate content',
  featureSummarize: 'Summarize',
  featureSemantic: 'Analyze content',
  featureToc: 'Generate TOC',

  descRewrite: 'Rewrite selected text in a different style',
  descTranslate: 'Translate to another language',
  descGrammar: 'Fix spelling and grammar mistakes',
  descGenerate: 'Generate text with AI',
  descSummarize: 'Summarize the content',
  descSemantic: 'Extract keywords and topics',
  descToc: 'Create a table of contents',

  rewriteStyleTitle: 'Rewriting style',
  rewriteFormal: 'Formal',
  rewriteFormalDesc: 'Professional and academic tone',
  rewriteCasual: 'Casual',
  rewriteCasualDesc: 'Natural and relaxed tone',
  rewriteConcise: 'More concise',
  rewriteConciseDesc: 'Get straight to the point',
  rewriteExpanded: 'More detailed',
  rewriteExpandedDesc: 'Add details and nuances',
  rewriteStyleLabel: 'Style: {style}',

  translateTargetTitle: 'Target language',

  grammarDescription: 'Text corrected automatically',

  generateTitle: 'Generate content',
  generateDesc: 'Describe what you want to generate, then press Generate.',
  generatePlaceholder: 'Example: Write a paragraph about the benefits of remote work...',
  generateModalTitle: 'Generate content',
  generateResultTitle: 'Generated content',
  generateResultDesc: 'Generation result',

  summarizeTitle: 'Summary',
  summarizeFormatTitle: 'Summary format',
  summarizeParagraph: 'Paragraph',
  summarizeParagraphDesc: 'Written summary (selection or full document)',
  summarizeBullets: 'Key points',
  summarizeBulletsDesc: 'Main ideas (selection or full document)',
  summarizeResultTitle: 'Summary',
  summarizeResultBullets: 'Key points',
  summarizeResultParagraph: 'Paragraph summary',
  summarizePrefix: '\n\nSummary:\n',

  semanticTitle: 'Content analysis',
  semanticStats: 'Statistics',
  semanticWords: 'Words',
  semanticReadingTime: 'Reading time',
  semanticTopics: 'Topics',
  semanticKeywordsCount: 'Keywords',
  semanticKeywordsTitle: 'Keywords',

  btnApply: 'Apply',
  btnCancel: 'Cancel',
  btnClose: 'Close',
  btnGenerate: 'Generate',
  loadingModel: 'Loading model...',
  preparing: 'Preparing...',
};

export interface AiOptions {
  provider?: AiProviderType;
  api_key?: string | null;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
  models?: Partial<Record<AiFeature, string>>;
  debug?: boolean;
  reasoning?: boolean;
  temperature?: number;
  labels?: Partial<AiLabels>;
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
