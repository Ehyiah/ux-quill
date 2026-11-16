import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import { SummarizeFeature } from '../src/modules/aiAssistant/features/summarizeFeature';

describe('SummarizeFeature', () => {
    afterEach(() => {
        document.querySelectorAll('.ai-assistant-notice').forEach((notice) => notice.remove());
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('shows the shared notice when there is no text to summarize', async () => {
        jest.useFakeTimers();
        const root = document.createElement('div');
        root.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 100,
            top: 80,
            right: 500,
            bottom: 280,
        });
        const aiManager = {
            getLabels: jest.fn().mockReturnValue({
                featureSummarize: 'Summarize',
                summarizeNoContent: 'No text to summarize.',
                btnClose: 'Close',
            }),
        } as unknown as AiManager;
        const quill = {
            getSelection: jest.fn().mockReturnValue(null),
            getText: jest.fn().mockReturnValue('  \n '),
            getLength: jest.fn().mockReturnValue(1),
            scroll: { domNode: root },
        };
        const feature = new SummarizeFeature(quill, aiManager);

        await feature.trigger();

        const notice = document.querySelector('.ai-assistant-notice') as HTMLElement;
        expect(notice.querySelector('[role="status"]')?.textContent).toBe('No text to summarize.');
        expect(notice.querySelector('button')?.getAttribute('aria-label')).toBe('Close');
        expect(notice.style.left).toBe('300px');
        expect(notice.style.top).toBe('180px');
    });
});
