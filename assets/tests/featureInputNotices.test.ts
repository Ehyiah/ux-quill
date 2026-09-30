import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import { GrammarFeature } from '../src/modules/aiAssistant/features/grammarFeature';
import { RewriteFeature } from '../src/modules/aiAssistant/features/rewriteFeature';
import { SynonymFeature } from '../src/modules/aiAssistant/features/synonymFeature';
import { TranslateFeature } from '../src/modules/aiAssistant/features/translateFeature';

describe('AI feature input notices', () => {
    let root: HTMLDivElement;
    let aiManager: AiManager;

    beforeEach(() => {
        jest.useFakeTimers();
        root = document.createElement('div');
        const provider = { correct: jest.fn().mockResolvedValue([]) };
        aiManager = {
            getLabels: jest.fn().mockReturnValue({
                featureRewrite: 'Rewrite',
                featureTranslate: 'Translate',
                featureSynonym: 'Synonym',
                featureGrammar: 'Grammar',
                selectionRequired: 'Select text first.',
                synonymWordRequired: 'Select a word.',
                grammarNoContent: 'There is no text to check.',
                grammarNoIssues: 'No grammar issues were found.',
                btnClose: 'Close',
            }),
            getProvider: jest.fn().mockReturnValue(provider),
            setLoading: jest.fn(),
            reportError: jest.fn(),
        } as unknown as AiManager;
    });

    afterEach(() => {
        document.querySelectorAll('.ai-assistant-notice').forEach((notice) => notice.remove());
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('asks for selected text in rewrite, translate, and synonym', async () => {
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getLength: jest.fn().mockReturnValue(1),
            getText: jest.fn().mockReturnValue(''),
            scroll: { domNode: root },
        };
        const features = [
            new RewriteFeature(quill, aiManager),
            new TranslateFeature(quill, aiManager),
            new SynonymFeature(quill, aiManager),
        ];

        for (const feature of features) {
            await feature.trigger();
            expect(document.querySelector('[role="status"]')?.textContent).toBe('Select text first.');
        }

        expect(aiManager.getProvider).not.toHaveBeenCalled();
    });

    it('asks for a word when the selection contains no word', async () => {
        const quill = {
            getSelection: jest.fn().mockReturnValue({ index: 0, length: 3 }),
            getLength: jest.fn().mockReturnValue(4),
            getText: jest.fn().mockReturnValue('!'),
            scroll: { domNode: root },
        };

        await new SynonymFeature(quill, aiManager).trigger();

        expect(document.querySelector('[role="status"]')?.textContent).toBe('Select a word.');
        expect(aiManager.getProvider).not.toHaveBeenCalled();
    });

    it('explains when there is no text to check for grammar', async () => {
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getLength: jest.fn().mockReturnValue(1),
            getText: jest.fn().mockReturnValue('  \n '),
            scroll: { domNode: root },
        };

        await new GrammarFeature(quill, aiManager).trigger();

        expect(document.querySelector('[role="status"]')?.textContent).toBe('There is no text to check.');
        expect(aiManager.getProvider).not.toHaveBeenCalled();
    });

    it('reports when grammar correction found no changes', async () => {
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getLength: jest.fn().mockReturnValue(11),
            getText: jest.fn().mockReturnValue('All correct'),
            updateContents: jest.fn(),
            scroll: { domNode: root },
        };

        await new GrammarFeature(quill, aiManager).trigger();

        expect(document.querySelector('[role="status"]')?.textContent).toBe('No grammar issues were found.');
    });
});
