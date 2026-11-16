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

    it('emits per-feature model progress without polling', async () => {
        jest.doMock('@huggingface/transformers', () => ({
            pipeline: async (_task: string, _model: string, options: { progress_callback: (p: { status: string; progress?: number }) => void }) => {
                options.progress_callback({ status: 'progress_total', progress: 50 });
                options.progress_callback({ status: 'ready' });

                return async () => [{ generated_text: 'mocked' }];
            },
        }));

        const { TransformersProvider } = await import('../src/modules/aiAssistant/providers/transformers');
        const globalPct: number[] = [];
        const provider: TransformersProviderType = new TransformersProvider((p) => globalPct.push(p));

        const seenA: number[] = [];
        const seenB: number[] = [];
        provider.onModelProgress('rewrite', (p) => seenB.push(p));
        const unsubscribeA = provider.onModelProgress('rewrite', (p) => seenA.push(p));

        unsubscribeA();

        await provider.rewrite('hello world', 'formal');

        expect(seenA).toEqual([]);
        expect(seenB).toEqual([50, 100]);
        expect(globalPct).toEqual([0, 50, 100]);
    });
});
