import type { WllamaProvider as WllamaProviderType } from '../src/modules/aiAssistant/providers/wllama';

function fakeWllamaClass(options: { failures?: unknown[] } = {}) {
    const loadHf = jest.fn().mockImplementation(async () => {
        const failure = options.failures?.[loadHf.mock.calls.length - 1];
        if (failure) {
            throw failure;
        }
        return undefined;
    });
    const instances: any[] = [];

    class FakeWllama {
        cacheManager = {
            list: jest.fn().mockResolvedValue([]),
            delete: jest.fn().mockResolvedValue(undefined),
            clear: jest.fn().mockResolvedValue(undefined),
        };
        loadModelFromHF = loadHf;
        createChatCompletion = jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mocked response' } }],
        });

        constructor() {
            instances.push(this);
        }
    }

    return { FakeWllama, loadHf, instances };
}

describe('WllamaProvider cache recovery', () => {
    afterEach(() => {
        jest.resetModules();
        jest.dontMock('@wllama/wllama');
        jest.restoreAllMocks();
    });

    it('detects corrupted-cache errors', async () => {
        const { isCorruptedCacheError } = await import('../src/modules/aiAssistant/providers/wllama');

        expect(isCorruptedCacheError(new RangeError('Offset is outside the bounds of the DataView'))).toBe(true);
        expect(isCorruptedCacheError(new Error('GGUF file is corrupt'))).toBe(true);
        expect(isCorruptedCacheError(new Error('network timeout'))).toBe(false);
    });

    it('purges size-mismatched cache entries for the model before loading', async () => {
        const deleteSpy = jest.fn().mockResolvedValue(undefined);
        const hfUrl = 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf';

        jest.doMock('@wllama/wllama', () => ({
            Wllama: class {
                cacheManager = {
                    list: jest.fn().mockResolvedValue([
                        { name: 'model.gguf', size: 1234, metadata: { originalSize: 351_000_000, originalURL: hfUrl } },
                        { name: 'other.bin', size: 10, metadata: { originalSize: 10, originalURL: 'https://example.org/other.bin' } },
                    ]),
                    delete: deleteSpy,
                };
                loadModelFromHF = jest.fn().mockResolvedValue(undefined);
                createChatCompletion = jest.fn().mockResolvedValue({
                    choices: [{ message: { content: 'ok' } }],
                });
            },
        }));

        const { WllamaProvider } = await import('../src/modules/aiAssistant/providers/wllama');
        const provider = new WllamaProvider() as unknown as WllamaProviderType;

        await provider.rewrite('hello world', 'formal');

        expect(deleteSpy).toHaveBeenCalledWith('model.gguf');
        expect(deleteSpy).not.toHaveBeenCalledWith('other.bin');
    });

    it('retries once bypassing the cache when the GGUF parse fails', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const { FakeWllama, loadHf } = fakeWllamaClass({
            failures: [new RangeError('Offset is outside the bounds of the DataView')],
        });

        jest.doMock('@wllama/wllama', () => ({ Wllama: FakeWllama }));

        const { WllamaProvider } = await import('../src/modules/aiAssistant/providers/wllama');
        const provider = new WllamaProvider() as unknown as WllamaProviderType;

        await provider.rewrite('hello world', 'formal');

        expect(loadHf).toHaveBeenCalledTimes(2);
        expect((loadHf.mock.calls[0] as unknown[])[1]).toMatchObject({ useCache: true });
        expect((loadHf.mock.calls[1] as unknown[])[1]).toMatchObject({ useCache: false });
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('escalates to a full cache wipe after repeated corrupted loads', async () => {
        jest.spyOn(console, 'debug').mockImplementation(() => {});
        const { FakeWllama, loadHf, instances } = fakeWllamaClass({
            failures: [
                new RangeError('Offset is outside the bounds of the DataView'),
                new RangeError('Offset is outside the bounds of the DataView'),
            ],
        });

        jest.doMock('@wllama/wllama', () => ({ Wllama: FakeWllama }));

        const { WllamaProvider } = await import('../src/modules/aiAssistant/providers/wllama');
        const provider = new WllamaProvider({ debug: true }) as unknown as WllamaProviderType;

        await provider.rewrite('hello world', 'formal');

        expect(loadHf).toHaveBeenCalledTimes(3);
        expect((loadHf.mock.calls[0] as unknown[])[1]).toMatchObject({ useCache: true });
        expect((loadHf.mock.calls[1] as unknown[])[1]).toMatchObject({ useCache: false });
        expect((loadHf.mock.calls[2] as unknown[])[1]).toMatchObject({ useCache: false });
        expect(instances.some((instance) => instance.cacheManager.clear.mock.calls.length > 0)).toBe(true);
    });

    it('resets the model after an inference crash so the next use reloads it', async () => {
        const { FakeWllama, instances } = fakeWllamaClass();

        jest.doMock('@wllama/wllama', () => ({ Wllama: FakeWllama }));

        const { WllamaProvider } = await import('../src/modules/aiAssistant/providers/wllama');
        const provider = new WllamaProvider() as unknown as WllamaProviderType & { wllamaInstance: any; loadPromise: any };

        await provider.rewrite('hello world', 'formal');
        expect(provider.wllamaInstance).not.toBeNull();

        instances[0].createChatCompletion.mockRejectedValueOnce(
            new RangeError('Offset is outside the bounds of the DataView'),
        );

        await expect(provider.rewrite('hello again', 'formal')).rejects.toThrow(/Wllama inference failed/);
        expect(provider.wllamaInstance).toBeNull();
        expect(provider.loadPromise).toBeNull();
    });

    it('propagates non-corruption errors without retrying', async () => {
        const { FakeWllama, loadHf } = fakeWllamaClass({ failures: [new Error('network down')] });

        jest.doMock('@wllama/wllama', () => ({ Wllama: FakeWllama }));

        const { WllamaProvider } = await import('../src/modules/aiAssistant/providers/wllama');
        const provider = new WllamaProvider() as unknown as WllamaProviderType;

        await expect(provider.rewrite('hello world', 'formal')).rejects.toThrow(/network down/);

        expect(loadHf).toHaveBeenCalledTimes(1);
    });
});
