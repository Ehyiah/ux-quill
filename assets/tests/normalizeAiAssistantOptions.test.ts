import { normalizeAiAssistantOptions } from '../src/modules/aiAssistant/normalizeOptions';

describe('normalizeAiAssistantOptions', () => {
  it('forwards manager and per-feature options from the Symfony module', () => {
    const normalized = normalizeAiAssistantOptions({
      provider: 'wllama',
      features: ['translate', 'toc', 'synonym', 'invalid'],
      model: 'local/model.gguf',
      temperature: 0.35,
      ui_language: 'fr',
      labels: { panelTitle: 'Assistant' },
      translate: { target_languages: ['fr', 'de'], default_language: 'de' },
      toc: { depth: 2 },
      synonym: { count: 8 },
      keyboardShortcut: false,
    });

    expect(normalized).toEqual({
      aiOptions: {
        provider: 'wllama',
        features: { translate: true, toc: true, synonym: true },
        debug: false,
        model: 'local/model.gguf',
        temperature: 0.35,
        ui_language: 'fr',
        labels: { panelTitle: 'Assistant' },
        translate: { target_languages: ['fr', 'de'], default_language: 'de' },
        toc: { depth: 2 },
        synonym: { count: 8 },
      },
      keyboardShortcut: false,
    });
  });

  it('keeps defaults for omitted options and filters unknown features', () => {
    expect(normalizeAiAssistantOptions({ features: ['rewrite', 'unknown'] })).toEqual({
      aiOptions: { provider: 'transformers', features: { rewrite: true }, debug: false },
      keyboardShortcut: { key: 'Space', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false },
    });
  });

  it('disables the module when there are no supported features', () => {
    expect(normalizeAiAssistantOptions({ features: [] })).toBeNull();
    expect(normalizeAiAssistantOptions({ features: ['unknown'] })).toBeNull();
  });
});
