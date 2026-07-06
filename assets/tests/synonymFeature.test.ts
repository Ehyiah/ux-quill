import { SynonymFeature } from '../src/modules/aiAssistant/features/synonymFeature';
import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import type { AiProvider, SynonymResult } from '../src/modules/aiAssistant/aiTypes';

describe('SynonymFeature', () => {
  let mockQuill: any;
  let mockAiManager: any;
  let mockProvider: jest.Mocked<AiProvider>;
  let feature: SynonymFeature;
  let mockContent = '';

  beforeEach(() => {
    jest.clearAllMocks();

    mockProvider = {
      name: 'api',
      requiresApiKey: false,
      supportedFeatures: ['synonym'],
      isAvailable: jest.fn().mockReturnValue(true),
      findSynonyms: jest.fn(),
      rewrite: jest.fn(),
      translate: jest.fn(),
      correct: jest.fn(),
      generate: jest.fn(),
      summarize: jest.fn(),
      analyze: jest.fn(),
    };

    mockAiManager = {
      getProvider: jest.fn().mockReturnValue(mockProvider),
      getLabels: jest.fn().mockReturnValue({
        featureSynonym: 'Find synonym',
        synonymTitle: 'Synonyms',
        synonymNoResults: 'No synonyms found',
        synonymClickToReplace: 'Click to replace',
      }),
      setLoading: jest.fn(),
    } as unknown as jest.Mocked<AiManager>;

    mockQuill = {
      getSelection: jest.fn(),
      getText: jest.fn().mockImplementation((i?: number, len?: number) => {
        if (i === undefined) return mockContent;
        return mockContent.slice(i, i + (len ?? 1)) || '';
      }),
      getLength: jest.fn().mockReturnValue(100),
      getFormat: jest.fn().mockReturnValue({}),
      deleteText: jest.fn(),
      insertText: jest.fn(),
      updateContents: jest.fn(),
      setSelection: jest.fn(),
      getBounds: jest.fn().mockReturnValue({ left: 100, top: 100, height: 20, width: 50 }),
      container: {
        getBoundingClientRect: jest.fn().mockReturnValue({ left: 0, top: 0, width: 500, height: 300 }),
      },
    };

    feature = new SynonymFeature(mockQuill, mockAiManager, { count: 5 });
  });

  describe('trigger', () => {
    it('should not proceed if no selection', async () => {
      mockQuill.getSelection.mockReturnValue(null);

      await feature.trigger();

      expect(mockProvider.findSynonyms).not.toHaveBeenCalled();
    });

    it('should not proceed if selection length is 0', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 5, length: 0 });

      await feature.trigger();

      expect(mockProvider.findSynonyms).not.toHaveBeenCalled();
    });

    it('should call findSynonyms with expanded word and count', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 6, length: 3 });
      mockContent = 'Hello world';
      mockProvider.findSynonyms.mockResolvedValue([{ word: 'globe' }, { word: 'earth' }]);

      const triggerPromise = feature.trigger();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const popup = document.querySelector('.ai-assistant-submenu');
      expect(popup).not.toBeNull();
      expect(popup?.textContent).toContain('globe');
      expect(popup?.textContent).toContain('earth');

      document.body.click();
      await triggerPromise;

      expect(mockAiManager.setLoading).toHaveBeenCalledWith(true);
      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('world', 5);
      expect(mockAiManager.setLoading).toHaveBeenCalledWith(false);
    });

    it('should show no results popup when no synonyms found', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 6, length: 5 });
      mockContent = 'Hello world';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await feature.trigger();

      expect(mockAiManager.setLoading).toHaveBeenCalledWith(true);
      expect(mockAiManager.setLoading).toHaveBeenCalledWith(false);

      const popup = document.querySelector('.ai-assistant-submenu');
      expect(popup).not.toBeNull();
      expect(popup?.textContent).toContain('No synonyms found');

      document.body.click();
    });

it('should replace only the word when synonym is clicked', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 6, length: 4 });
      mockContent = 'Hello beautiful world';
      mockProvider.findSynonyms.mockResolvedValue([
        { word: 'gorgeous', score: 0.95 },
        { word: 'pretty', score: 0.8 },
      ]);

      const triggerPromise = feature.trigger();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const items = document.querySelectorAll('.ai-assistant-submenu-item');
      expect(items.length).toBe(2);

      (items[0] as HTMLElement).click();

      await triggerPromise;

      expect(mockQuill.updateContents).toHaveBeenCalledWith([
        { retain: 6 },
        { delete: 9 },
        { insert: 'gorgeous' },
      ]);
      expect(mockQuill.setSelection).toHaveBeenCalledWith(6 + 'gorgeous'.length, 0, 'user');
    });

    it('should expand partial selection to complete word', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 4, length: 2 });
      mockContent = 'an action to';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await feature.trigger();

      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('action', 5);
    });

    it('should exclude trailing space from selection', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 3, length: 7 });
      mockContent = 'an action to';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await feature.trigger();

      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('action', 5);
    });

    it('should handle provider errors gracefully', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 6, length: 5 });
      mockContent = 'Hello world';
      mockProvider.findSynonyms.mockRejectedValue(new Error('API error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await feature.trigger();

      expect(mockAiManager.setLoading).toHaveBeenCalledWith(true);
      expect(mockAiManager.setLoading).toHaveBeenCalledWith(false);
      expect(consoleSpy).toHaveBeenCalledWith('Synonym search failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should use default count of 5 if not provided', async () => {
      const featureWithoutConfig = new SynonymFeature(mockQuill, mockAiManager);
      mockQuill.getSelection.mockReturnValue({ index: 6, length: 5 });
      mockContent = 'Hello world';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await featureWithoutConfig.trigger();

      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('world', 5);
    });

    it('should capture only first word when selection spans multiple words', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 4, length: 11 });
      mockContent = 'the toolbar and menu';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await feature.trigger();

      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('toolbar', 5);
    });

    it('should handle French word with accents', async () => {
      mockQuill.getSelection.mockReturnValue({ index: 4, length: 3 });
      mockContent = 'le résumé est complet';
      mockProvider.findSynonyms.mockResolvedValue([]);

      await feature.trigger();

      expect(mockProvider.findSynonyms).toHaveBeenCalledWith('résumé', 5);
    });
  });

  describe('feature properties', () => {
    it('should have correct name', () => {
      expect(feature.name).toBe('synonym');
    });

    it('should require selection', () => {
      expect(feature.requiresSelection).toBe(true);
    });

    it('should have label from manager', () => {
      expect(feature.label).toBe('Find synonym');
    });
  });
});