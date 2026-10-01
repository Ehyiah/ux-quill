import type { AiKeyboardShortcut } from '../../types.d.ts';
import type { AiFeature, AiOptions, AiProviderType, UiLanguage } from './aiTypes.js';

const AI_FEATURES: readonly AiFeature[] = [
  'rewrite',
  'translate',
  'grammar',
  'generate',
  'summarize',
  'toc',
  'synonym',
];

const UI_LANGUAGES: readonly UiLanguage[] = ['en', 'fr', 'de', 'es'];
const DEFAULT_KEYBOARD_SHORTCUT: AiKeyboardShortcut = {
  key: 'Space',
  ctrlKey: true,
  shiftKey: false,
  altKey: false,
  metaKey: false,
};

export interface NormalizedAiAssistantOptions {
  aiOptions: AiOptions;
  keyboardShortcut: AiKeyboardShortcut | false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Converts the Symfony module options into the frontend AI manager options. */
export function normalizeAiAssistantOptions(raw: Record<string, unknown>): NormalizedAiAssistantOptions | null {
  if (!Array.isArray(raw.features) || raw.features.length === 0) {
    return null;
  }

  const features: NonNullable<AiOptions['features']> = {};
  raw.features.forEach((feature: unknown) => {
    if (typeof feature === 'string' && (AI_FEATURES as readonly string[]).includes(feature)) {
      features[feature as AiFeature] = true;
    }
  });

  if (Object.keys(features).length === 0) {
    return null;
  }

  const provider: AiProviderType = raw.provider === 'api' || raw.provider === 'wllama'
    ? raw.provider
    : 'transformers';
  const aiOptions: AiOptions = {
    provider,
    features,
    debug: !!raw.debug,
  };

  if (typeof raw.model === 'string' && raw.model.length > 0) {
    aiOptions.model = raw.model;
  }
  if (typeof raw.temperature === 'number' && Number.isFinite(raw.temperature)) {
    aiOptions.temperature = raw.temperature;
  }
  if (typeof raw.ui_language === 'string' && (UI_LANGUAGES as readonly string[]).includes(raw.ui_language)) {
    aiOptions.ui_language = raw.ui_language as UiLanguage;
  }
  if (isRecord(raw.labels)) {
    aiOptions.labels = raw.labels as AiOptions['labels'];
  }
  if (isRecord(raw.translate)) {
    aiOptions.translate = raw.translate as AiOptions['translate'];
  }
  if (isRecord(raw.toc)) {
    aiOptions.toc = raw.toc as AiOptions['toc'];
  }
  if (isRecord(raw.synonym)) {
    aiOptions.synonym = raw.synonym as AiOptions['synonym'];
  }

  const keyboardShortcut = raw.keyboardShortcut === false
    ? false
    : isRecord(raw.keyboardShortcut) && typeof raw.keyboardShortcut.key === 'string'
      ? raw.keyboardShortcut as AiKeyboardShortcut
      : DEFAULT_KEYBOARD_SHORTCUT;

  return { aiOptions, keyboardShortcut };
}
