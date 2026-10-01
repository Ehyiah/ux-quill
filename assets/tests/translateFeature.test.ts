import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import { TranslateFeature } from '../src/modules/aiAssistant/features/translateFeature';

describe('TranslateFeature options', () => {
  afterEach(() => {
    document.querySelectorAll('.ai-assistant-submenu').forEach((element) => element.remove());
  });

  it('limits languages and marks the configured default', async () => {
    const aiManager = {
      getLabels: jest.fn().mockReturnValue({ translateTargetTitle: 'Translate to' }),
    } as unknown as AiManager;
    const feature = new TranslateFeature({}, aiManager, {
      target_languages: ['fr', 'de'],
      default_language: 'de',
    });
    const anchorRect = { left: 10, right: 20, top: 10, bottom: 20 } as DOMRect;
    const selection = (feature as any).promptLanguage(anchorRect) as Promise<string | null>;

    const items = Array.from(document.querySelectorAll<HTMLButtonElement>('.ai-assistant-submenu-item'));
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.querySelector('.ai-assistant-submenu-label')?.textContent)).toEqual(['Français', 'Deutsch']);
    expect(items.map((item) => item.getAttribute('aria-pressed'))).toEqual(['false', 'true']);

    items[1].click();
    await expect(selection).resolves.toBe('de');
  });
});
