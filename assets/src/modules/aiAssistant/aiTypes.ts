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

export type UiLanguage = 'en' | 'fr' | 'de' | 'es';

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

export const LOCALES: Record<UiLanguage, Partial<AiLabels>> = {
  en: {},
  fr: {
    featureRewrite: 'Reformuler',
    featureTranslate: 'Traduire',
    featureGrammar: 'Corriger la grammaire',
    featureGenerate: 'G\u00E9n\u00E9rer du contenu',
    featureSummarize: 'R\u00E9sumer',
    featureSemantic: 'Analyser le contenu',
    featureToc: 'G\u00E9n\u00E9rer le sommaire',
    descRewrite: 'Changer le style du texte s\u00E9lectionn\u00E9',
    descTranslate: 'Traduire dans une autre langue',
    descGrammar: 'Corriger les fautes d\u2019orthographe',
    descGenerate: 'G\u00E9n\u00E9rer du texte par IA',
    descSummarize: 'R\u00E9sumer le contenu',
    descSemantic: 'Analyser les mots-cl\u00E9s et sujets',
    descToc: 'Cr\u00E9er une table des mati\u00E8res',
    rewriteStyleTitle: 'Style de r\u00E9\u00E9criture',
    rewriteFormal: 'Formel',
    rewriteFormalDesc: 'Ton professionnel et soutenu',
    rewriteCasual: 'D\u00E9contract\u00E9',
    rewriteCasualDesc: 'Ton naturel et d\u00E9tendu',
    rewriteConcise: 'Plus concis',
    rewriteConciseDesc: 'Aller droit au but',
    rewriteExpanded: 'Plus d\u00E9velopp\u00E9',
    rewriteExpandedDesc: 'Ajouter des d\u00E9tails et des nuances',
    rewriteStyleLabel: 'Style : {style}',
    translateTargetTitle: 'Langue de destination',
    grammarDescription: 'Texte corrig\u00E9 automatiquement',
    generateTitle: 'G\u00E9n\u00E9rer du contenu',
    generateDesc: 'D\u00E9crivez ce que vous voulez g\u00E9n\u00E9rer, puis appuyez sur G\u00E9n\u00E9rer.',
    generatePlaceholder: 'Exemple : \u00C9cris un paragraphe sur les avantages du t\u00E9l\u00E9travail...',
    generateModalTitle: 'G\u00E9n\u00E9rer du contenu',
    generateResultTitle: 'Contenu g\u00E9n\u00E9r\u00E9',
    generateResultDesc: 'R\u00E9sultat de la g\u00E9n\u00E9ration',
    summarizeTitle: 'R\u00E9sum\u00E9',
    summarizeFormatTitle: 'Format du r\u00E9sum\u00E9',
    summarizeParagraph: 'Paragraphe',
    summarizeParagraphDesc: 'R\u00E9sum\u00E9 r\u00E9dig\u00E9 (s\u00E9lection ou document entier)',
    summarizeBullets: 'Points cl\u00E9s',
    summarizeBulletsDesc: 'Id\u00E9es principales (s\u00E9lection ou document entier)',
    summarizeResultTitle: 'R\u00E9sum\u00E9',
    summarizeResultBullets: 'Points cl\u00E9s',
    summarizeResultParagraph: 'R\u00E9sum\u00E9 en paragraphe',
    summarizePrefix: '\n\nR\u00E9sum\u00E9 :\n',
    semanticTitle: 'Analyse du contenu',
    semanticStats: 'Statistiques',
    semanticWords: 'Mots',
    semanticReadingTime: 'Temps de lecture',
    semanticTopics: 'Sujets',
    semanticKeywordsCount: 'Mots-cl\u00E9s',
    semanticKeywordsTitle: 'Mots-cl\u00E9s',
    btnApply: 'Appliquer',
    btnCancel: 'Annuler',
    btnClose: 'Fermer',
    btnGenerate: 'G\u00E9n\u00E9rer',
    loadingModel: 'Chargement du mod\u00E8le...',
    preparing: 'Pr\u00E9paration...',
  },
  de: {
    featureRewrite: 'Umformulieren',
    featureTranslate: '\u00DCbersetzen',
    featureGrammar: 'Grammatik korrigieren',
    featureGenerate: 'Inhalt generieren',
    featureSummarize: 'Zusammenfassen',
    featureSemantic: 'Inhalt analysieren',
    featureToc: 'Inhaltsverzeichnis erstellen',
    descRewrite: 'Ausgew\u00E4hlten Text in einem anderen Stil umformulieren',
    descTranslate: 'In eine andere Sprache \u00FCbersetzen',
    descGrammar: 'Rechtschreib- und Grammatikfehler korrigieren',
    descGenerate: 'Text mit KI generieren',
    descSummarize: 'Den Inhalt zusammenfassen',
    descSemantic: 'Schl\u00FCsselw\u00F6rter und Themen extrahieren',
    descToc: 'Inhaltsverzeichnis erstellen',
    rewriteStyleTitle: 'Umformulierungsstil',
    rewriteFormal: 'Formell',
    rewriteFormalDesc: 'Professioneller und akademischer Ton',
    rewriteCasual: 'Locker',
    rewriteCasualDesc: 'Nat\u00FCrlicher und entspannter Ton',
    rewriteConcise: 'Kompakter',
    rewriteConciseDesc: 'Direkt auf den Punkt kommen',
    rewriteExpanded: 'Ausf\u00FChrlicher',
    rewriteExpandedDesc: 'Details und Nuancen hinzuf\u00FCgen',
    rewriteStyleLabel: 'Stil: {style}',
    translateTargetTitle: 'Zielsprache',
    grammarDescription: 'Text automatisch korrigiert',
    generateTitle: 'Inhalt generieren',
    generateDesc: 'Beschreiben Sie, was Sie generieren m\u00F6chten, und dr\u00FCcken Sie dann Generieren.',
    generatePlaceholder: 'Beispiel: Schreiben Sie einen Absatz \u00FCber die Vorteile des Remote-Arbeitens...',
    generateModalTitle: 'Inhalt generieren',
    generateResultTitle: 'Generierter Inhalt',
    generateResultDesc: 'Generierungsergebnis',
    summarizeTitle: 'Zusammenfassung',
    summarizeFormatTitle: 'Zusammenfassungsformat',
    summarizeParagraph: 'Absatz',
    summarizeParagraphDesc: 'Schriftliche Zusammenfassung (Auswahl oder gesamtes Dokument)',
    summarizeBullets: 'Hauptpunkte',
    summarizeBulletsDesc: 'Wichtigste Ideen (Auswahl oder gesamtes Dokument)',
    summarizeResultTitle: 'Zusammenfassung',
    summarizeResultBullets: 'Hauptpunkte',
    summarizeResultParagraph: 'Absatz-Zusammenfassung',
    summarizePrefix: '\n\nZusammenfassung:\n',
    semanticTitle: 'Inhaltsanalyse',
    semanticStats: 'Statistiken',
    semanticWords: 'W\u00F6rter',
    semanticReadingTime: 'Lesezeit',
    semanticTopics: 'Themen',
    semanticKeywordsCount: 'Schl\u00FCsselw\u00F6rter',
    semanticKeywordsTitle: 'Schl\u00FCsselw\u00F6rter',
    btnApply: 'Anwenden',
    btnCancel: 'Abbrechen',
    btnClose: 'Schlie\u00DFen',
    btnGenerate: 'Generieren',
    loadingModel: 'Modell wird geladen...',
    preparing: 'Vorbereitung...',
  },
  es: {
    featureRewrite: 'Reformular',
    featureTranslate: 'Traducir',
    featureGrammar: 'Corregir gram\u00E1tica',
    featureGenerate: 'Generar contenido',
    featureSummarize: 'Resumir',
    featureSemantic: 'Analizar contenido',
    featureToc: 'Generar \u00EDndice',
    descRewrite: 'Reformular el texto seleccionado en un estilo diferente',
    descTranslate: 'Traducir a otro idioma',
    descGrammar: 'Corregir errores ortogr\u00E1ficos y gramaticales',
    descGenerate: 'Generar texto con IA',
    descSummarize: 'Resumir el contenido',
    descSemantic: 'Extraer palabras clave y temas',
    descToc: 'Crear una tabla de contenidos',
    rewriteStyleTitle: 'Estilo de reescritura',
    rewriteFormal: 'Formal',
    rewriteFormalDesc: 'Tono profesional y acad\u00E9mico',
    rewriteCasual: 'Informal',
    rewriteCasualDesc: 'Tono natural y relajado',
    rewriteConcise: 'M\u00E1s conciso',
    rewriteConciseDesc: 'Ir directo al grano',
    rewriteExpanded: 'M\u00E1s detallado',
    rewriteExpandedDesc: 'A\u00F1adir detalles y matices',
    rewriteStyleLabel: 'Estilo: {style}',
    translateTargetTitle: 'Idioma de destino',
    grammarDescription: 'Texto corregido autom\u00E1ticamente',
    generateTitle: 'Generar contenido',
    generateDesc: 'Describe lo que quieres generar, luego presiona Generar.',
    generatePlaceholder: 'Ejemplo: Escribe un p\u00E1rrafo sobre las ventajas del teletrabajo...',
    generateModalTitle: 'Generar contenido',
    generateResultTitle: 'Contenido generado',
    generateResultDesc: 'Resultado de la generaci\u00F3n',
    summarizeTitle: 'Resumen',
    summarizeFormatTitle: 'Formato del resumen',
    summarizeParagraph: 'P\u00E1rrafo',
    summarizeParagraphDesc: 'Resumen escrito (selecci\u00F3n o documento completo)',
    summarizeBullets: 'Puntos clave',
    summarizeBulletsDesc: 'Ideas principales (selecci\u00F3n o documento completo)',
    summarizeResultTitle: 'Resumen',
    summarizeResultBullets: 'Puntos clave',
    summarizeResultParagraph: 'Resumen en p\u00E1rrafo',
    summarizePrefix: '\n\nResumen:\n',
    semanticTitle: 'An\u00E1lisis de contenido',
    semanticStats: 'Estad\u00EDsticas',
    semanticWords: 'Palabras',
    semanticReadingTime: 'Tiempo de lectura',
    semanticTopics: 'Temas',
    semanticKeywordsCount: 'Palabras clave',
    semanticKeywordsTitle: 'Palabras clave',
    btnApply: 'Aplicar',
    btnCancel: 'Cancelar',
    btnClose: 'Cerrar',
    btnGenerate: 'Generar',
    loadingModel: 'Cargando modelo...',
    preparing: 'Preparando...',
  },
};

export interface AiOptions {
  provider?: AiProviderType;
  api_key?: string | null;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
  models?: Partial<Record<AiFeature, string>>;
  debug?: boolean;
  reasoning?: boolean;
  temperature?: number;
  ui_language?: UiLanguage;
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
