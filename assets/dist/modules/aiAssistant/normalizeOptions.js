const AI_FEATURES = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'toc', 'synonym'];
const UI_LANGUAGES = ['en', 'fr', 'de', 'es'];
const DEFAULT_KEYBOARD_SHORTCUT = {
  key: 'Space',
  ctrlKey: true,
  shiftKey: false,
  altKey: false,
  metaKey: false
};
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Converts the Symfony module options into the frontend AI manager options. */
export function normalizeAiAssistantOptions(raw) {
  if (!Array.isArray(raw.features) || raw.features.length === 0) {
    return null;
  }
  const features = {};
  raw.features.forEach(feature => {
    if (typeof feature === 'string' && AI_FEATURES.includes(feature)) {
      features[feature] = true;
    }
  });
  if (Object.keys(features).length === 0) {
    return null;
  }
  const provider = raw.provider === 'api' || raw.provider === 'wllama' ? raw.provider : 'transformers';
  const aiOptions = {
    provider,
    features,
    debug: !!raw.debug
  };
  if (typeof raw.model === 'string' && raw.model.length > 0) {
    aiOptions.model = raw.model;
  }
  if (typeof raw.temperature === 'number' && Number.isFinite(raw.temperature)) {
    aiOptions.temperature = raw.temperature;
  }
  if (typeof raw.ui_language === 'string' && UI_LANGUAGES.includes(raw.ui_language)) {
    aiOptions.ui_language = raw.ui_language;
  }
  if (isRecord(raw.labels)) {
    aiOptions.labels = raw.labels;
  }
  if (isRecord(raw.translate)) {
    aiOptions.translate = raw.translate;
  }
  if (isRecord(raw.toc)) {
    aiOptions.toc = raw.toc;
  }
  if (isRecord(raw.synonym)) {
    aiOptions.synonym = raw.synonym;
  }
  const keyboardShortcut = raw.keyboardShortcut === false ? false : isRecord(raw.keyboardShortcut) && typeof raw.keyboardShortcut.key === 'string' ? raw.keyboardShortcut : DEFAULT_KEYBOARD_SHORTCUT;
  return {
    aiOptions,
    keyboardShortcut
  };
}