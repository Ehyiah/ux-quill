import type { TransformersProvider as TransformersProviderType } from '../src/modules/aiAssistant/providers/transformers';

describe('TransformersProvider module loading', () => {
    afterEach(() => {
        jest.resetModules();
        jest.dontMock('@huggingface/transformers');
        jest.restoreAllMocks();
    });

    it('warns and falls back to CDN when the local package fails, then throws a clear error', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        jest.doMock('@huggingface/transformers', () => {
            throw new Error('Cannot find module');
        });

        const { TransformersProvider } = await import('../src/modules/aiAssistant/providers/transformers');
        const provider: TransformersProviderType = new TransformersProvider();

        await expect(provider.rewrite('hello world', 'formal')).rejects.toThrow(
            /Failed to load @huggingface\/transformers/i,
        );

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('falling back to CDN'));
    });
});
