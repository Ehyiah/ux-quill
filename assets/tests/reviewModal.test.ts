import { showReviewModal } from '../src/modules/aiAssistant/utils/reviewModal';
import type { AiLabels } from '../src/modules/aiAssistant/aiTypes';

const labels = {
    btnApply: 'Apply',
    btnCancel: 'Cancel',
    btnClose: 'Close',
    btnGenerate: 'Generate',
    btnRegenerate: 'Regenerate',
} as AiLabels;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('showReviewModal', () => {
    afterEach(() => {
        document.querySelectorAll('.ai-assistant-modal-overlay').forEach(el => el.remove());
    });

    it('resolves the edited text on apply', async () => {
        const modal = showReviewModal({ title: 'T', description: 'D', generatedText: 'draft' }, labels);
        const overlay = document.querySelector('.ai-assistant-modal-overlay') as HTMLElement;
        const textarea = overlay.querySelector('textarea') as HTMLTextAreaElement;

        expect(textarea.value).toBe('draft');

        textarea.value = 'edited';
        const buttons = Array.from(overlay.querySelectorAll('.ai-assistant-modal-actions button'));
        (buttons[buttons.length - 1] as HTMLButtonElement).click();
        await flush();

        await expect(modal).resolves.toBe('edited');
        expect(document.querySelector('.ai-assistant-modal-overlay')).toBeNull();
    });

    it('renders a regenerate button and updates the content', async () => {
        let calls = 0;
        const modal = showReviewModal({
            title: 'T',
            description: 'D',
            generatedText: 'first',
            onRegenerate: jest.fn(() => {
                calls += 1;
                return Promise.resolve(`regenerated-${calls}`);
            }),
        }, labels);

        const regenerateBtn = document.querySelector('.ai-assistant-btn-regenerate') as HTMLButtonElement;
        expect(regenerateBtn).not.toBeNull();

        regenerateBtn.click();
        await flush();

        const textarea = document.querySelector('.ai-assistant-modal-overlay textarea') as HTMLTextAreaElement;
        expect(textarea.value).toBe('regenerated-1');
        expect(regenerateBtn.disabled).toBe(false);

        const cancelBtn = document.querySelector('.ai-assistant-btn-secondary:not(.ai-assistant-btn-regenerate)') as HTMLButtonElement;
        cancelBtn.click();
        await flush();

        await expect(modal).resolves.toBeNull();
    });

    it('rejects and closes when regeneration fails', async () => {
        const modal = showReviewModal({
            title: 'T',
            description: 'D',
            generatedText: 'first',
            onRegenerate: jest.fn(() => Promise.reject(new Error('boom'))),
        }, labels);

        const regenerateBtn = document.querySelector('.ai-assistant-btn-regenerate') as HTMLButtonElement;
        regenerateBtn.click();

        await expect(modal).rejects.toThrow('boom');
        expect(document.querySelector('.ai-assistant-modal-overlay')).toBeNull();
    });
});
