import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import { TocFeature } from '../src/modules/aiAssistant/features/tocFeature';

describe('TocFeature', () => {
    afterEach(() => {
        document.querySelectorAll('.ai-assistant-notice').forEach((notice) => notice.remove());
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('explains when no headings are eligible at the configured depth', async () => {
        jest.useFakeTimers();
        const root = document.createElement('div');
        root.innerHTML = '<h3>Details</h3>';
        root.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 100,
            top: 80,
            right: 500,
            bottom: 280,
        });
        const aiManager = {
            getLabels: jest.fn().mockReturnValue({
                featureToc: 'Generate TOC',
                tocNoHeadings: 'No headings up to H{depth} found.',
                btnClose: 'Close',
            }),
        } as unknown as AiManager;
        const feature = new TocFeature({ scroll: { domNode: root } }, aiManager, { depth: 2 });

        await feature.trigger();

        const notice = document.querySelector('.ai-assistant-notice') as HTMLElement;
        const message = notice.querySelector('[role="status"]');
        const closeButton = notice.querySelector('button') as HTMLButtonElement;
        expect(message?.textContent).toBe('No headings up to H2 found.');
        expect(closeButton.getAttribute('aria-label')).toBe('Close');
        expect(notice.style.left).toBe('300px');
        expect(notice.style.top).toBe('180px');

        closeButton.click();
        expect(document.querySelector('.ai-assistant-notice')).toBeNull();
    });
});
