import { GenerateFeature } from '../src/modules/aiAssistant/features/generateFeature';
import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import { showReviewModal } from '../src/modules/aiAssistant/utils/reviewModal';

jest.mock('../src/modules/aiAssistant/utils/reviewModal', () => ({
    showReviewModal: jest.fn(),
}));

const mockedShowReviewModal = showReviewModal as jest.MockedFunction<typeof showReviewModal>;

describe('GenerateFeature', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('keeps the prompt dialog open and shows a notice for an empty prompt', async () => {
        jest.useFakeTimers();
        const aiManager = {
            getLabels: jest.fn().mockReturnValue({
                featureGenerate: 'Generate content',
                generateModalTitle: 'Generate',
                generateDesc: 'Describe the content',
                generatePlaceholder: 'Prompt',
                generatePromptRequired: 'Enter a prompt first.',
                btnCancel: 'Cancel',
                btnGenerate: 'Generate',
                btnClose: 'Close',
            }),
            getProvider: jest.fn(),
        } as unknown as AiManager;
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getLength: jest.fn().mockReturnValue(1),
            updateContents: jest.fn(),
            scroll: { domNode: document.createElement('div') },
        };
        const feature = new GenerateFeature(quill, aiManager);

        const trigger = feature.trigger();
        (document.querySelector('.ai-assistant-btn-primary') as HTMLButtonElement).click();

        expect(document.querySelector('.ai-assistant-modal-overlay')).not.toBeNull();
        expect(document.querySelector('[role="status"]')?.textContent).toBe('Enter a prompt first.');
        expect(aiManager.getProvider).not.toHaveBeenCalled();

        (document.querySelector('.ai-assistant-modal-actions .ai-assistant-btn-secondary') as HTMLButtonElement).click();
        await trigger;
        expect(document.querySelector('.ai-assistant-modal-overlay')).toBeNull();
    });

    it('shows the module loading indicator while regenerating', async () => {
        let onRegenerate: (() => Promise<string>) | undefined;
        mockedShowReviewModal.mockImplementation((options) => {
            onRegenerate = options.onRegenerate;
            return Promise.resolve(null);
        });

        const provider = {
            generate: jest.fn()
                .mockResolvedValueOnce('initial result')
                .mockResolvedValueOnce('regenerated result'),
        };
        const aiManager = {
            getProvider: jest.fn().mockReturnValue(provider),
            getLabels: jest.fn().mockReturnValue({
                generateModalTitle: 'Generate',
                generateDesc: 'Describe the content',
                generatePlaceholder: 'Prompt',
                btnCancel: 'Cancel',
                btnGenerate: 'Generate',
                generateResultTitle: 'Result',
                generateResultDesc: 'Review the result',
            }),
            setLoading: jest.fn(),
            reportError: jest.fn(),
        } as unknown as AiManager;
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getLength: jest.fn().mockReturnValue(0),
            updateContents: jest.fn(),
        };
        const feature = new GenerateFeature(quill, aiManager);

        const trigger = feature.trigger();
        const prompt = document.querySelector('textarea') as HTMLTextAreaElement;
        prompt.value = 'Write a short introduction';
        (document.querySelector('.ai-assistant-btn-primary') as HTMLButtonElement).click();
        await trigger;

        expect(onRegenerate).toBeDefined();
        (aiManager.setLoading as jest.Mock).mockClear();

        const regeneration = onRegenerate!();
        expect(aiManager.setLoading).toHaveBeenCalledWith(true);
        await expect(regeneration).resolves.toBe('regenerated result');
        expect(aiManager.setLoading).toHaveBeenLastCalledWith(false);
    });
});
