import { AiManager } from '../src/modules/aiAssistant/aiManager';

describe('AiManager options', () => {
  it('uses locale overrides and exposes feature-specific module configuration', () => {
    const manager = new AiManager({
      provider: 'api',
      features: { translate: true, toc: true, synonym: true },
      ui_language: 'fr',
      labels: { panelTitle: 'Mon assistant' },
      translate: { target_languages: ['fr', 'de'], default_language: 'de' },
      toc: { depth: 2 },
      synonym: { count: 8 },
    });

    expect(manager.getLabels().panelTitle).toBe('Mon assistant');
    expect(manager.getLabels().featureTranslate).toBe('Traduire');
    expect(manager.getFeatureConfig('translate')).toEqual({ target_languages: ['fr', 'de'], default_language: 'de' });
    expect(manager.getFeatureConfig('toc')).toEqual({ depth: 2 });
    expect(manager.getFeatureConfig('synonym')).toEqual({ count: 8 });
  });

  it('lets an explicit per-feature config override the module-level config', () => {
    const manager = new AiManager({
      provider: 'api',
      features: { toc: { depth: 1 } },
      toc: { depth: 3 },
    });

    expect(manager.getFeatureConfig('toc')).toEqual({ depth: 1 });
  });
});
