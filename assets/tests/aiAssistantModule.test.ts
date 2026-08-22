import { AiAssistantModule } from '../src/modules/aiAssistant/aiAssistantModule';
import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import type { AiProvider } from '../src/modules/aiAssistant/aiTypes';

describe('AiAssistantModule', () => {
    let mockQuill: any;
    let mockProvider: jest.Mocked<AiProvider>;
    let mockAiManager: jest.Mocked<AiManager>;
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null;
    let errorHandler: ((error: Error) => void) | null = null;

    beforeEach(() => {
        document.body.innerHTML = '';
        keydownHandler = null;
        errorHandler = null;

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
        };

        mockAiManager = {
            getProvider: jest.fn().mockReturnValue(mockProvider),
            getLabels: jest.fn().mockReturnValue({
                featureSynonym: 'Find synonym',
                descSynonym: 'Find synonyms for selected word',
            }),
            setLoading: jest.fn(),
            onLoadingChange: jest.fn(),
            onDownloadProgress: jest.fn(),
            onError: jest.fn().mockImplementation((callback: (error: Error) => void) => {
                errorHandler = callback;
            }),
            reportError: jest.fn(),
        } as unknown as jest.Mocked<AiManager>;

        const containerEl = document.createElement('div');
        document.body.appendChild(containerEl);

        const toolbarContainer = document.createElement('div');
        containerEl.appendChild(toolbarContainer);

        mockQuill = {
            getSelection: jest.fn().mockReturnValue({ index: 0, length: 5 }),
            setSelection: jest.fn(),
            getBounds: jest.fn().mockReturnValue({ left: 120, top: 60, width: 50, height: 20 }),
            getModule: jest.fn().mockImplementation((name: string) => {
                if (name === 'toolbar') {
                    return {
                        container: toolbarContainer,
                    };
                }
                return undefined;
            }),
            root: {
                addEventListener: jest.fn().mockImplementation((event: string, handler: (event: KeyboardEvent) => void) => {
                    if (event === 'keydown') {
                        keydownHandler = handler;
                    }
                }),
            },
            container: containerEl,
        };

        containerEl.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 20,
            top: 30,
            width: 500,
            height: 300,
        });
    });

    afterEach(() => {
        document.querySelectorAll('.ai-assistant-backdrop').forEach(el => el.remove());
        document.querySelectorAll('.ai-assistant-panel').forEach(el => el.remove());
        document.querySelectorAll('.ai-assistant-error').forEach(el => el.remove());
    });

    function createModule(keyboardShortcut?: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } | false): AiAssistantModule {
        return new AiAssistantModule(mockQuill, {
            aiManager: mockAiManager,
            features: { synonym: true },
            keyboardShortcut,
        });
    }

    describe('keyboard shortcut', () => {
        it('should open the panel on Ctrl+Space below the current selection', () => {
            createModule();

            expect(keydownHandler).not.toBeNull();

            const event = new KeyboardEvent('keydown', {
                key: ' ',
                ctrlKey: true,
                bubbles: true,
            });
            const preventDefault = jest.spyOn(event, 'preventDefault');
            const stopPropagation = jest.spyOn(event, 'stopPropagation');

            keydownHandler!(event);

            expect(preventDefault).toHaveBeenCalled();
            expect(stopPropagation).toHaveBeenCalled();

            const panel = document.querySelector('.ai-assistant-panel') as HTMLElement;
            expect(panel).not.toBeNull();
            expect(panel.style.top).toBe('114px'); // container top 30 + bounds top 60 + height 20 + 4
            expect(panel.style.left).toBe('140px'); // container left 20 + bounds left 120
        });

        it('should not open the panel when shortcut is disabled', () => {
            createModule(false);

            expect(mockQuill.root.addEventListener).not.toHaveBeenCalled();
            expect(document.querySelector('.ai-assistant-panel')).toBeNull();
        });

        it('should respect custom shortcut key', () => {
            createModule({ key: 'j', ctrlKey: true, shiftKey: true });

            const wrongEvent = new KeyboardEvent('keydown', {
                key: ' ',
                ctrlKey: true,
            });
            keydownHandler!(wrongEvent);
            expect(document.querySelector('.ai-assistant-panel')).toBeNull();

            const rightEvent = new KeyboardEvent('keydown', {
                key: 'j',
                ctrlKey: true,
                shiftKey: true,
            });
            keydownHandler!(rightEvent);
            expect(document.querySelector('.ai-assistant-panel')).not.toBeNull();
        });

        it('should ignore shortcut when modifiers do not match', () => {
            createModule();

            const event = new KeyboardEvent('keydown', {
                key: ' ',
                ctrlKey: true,
                shiftKey: true,
            });
            keydownHandler!(event);

            expect(document.querySelector('.ai-assistant-panel')).toBeNull();
        });
    });

    describe('openPanel', () => {
        it('should position the panel relative to the provided anchor rect', () => {
            const module = createModule(false);

            const anchorRect = {
                left: 50,
                top: 80,
                bottom: 100,
                right: 70,
                width: 20,
                height: 20,
                x: 50,
                y: 80,
                toJSON: () => ({}),
            };

            module.openPanel(anchorRect);

            const panel = document.querySelector('.ai-assistant-panel') as HTMLElement;
            expect(panel).not.toBeNull();
            expect(panel.style.top).toBe('104px');
            expect(panel.style.left).toBe('50px');
        });

        it('should close on Escape and toggle aria-expanded', () => {
            const module = createModule(false);
            const button = document.querySelector('.ql-ai-assistant') as HTMLButtonElement;
            if (!button) {
                throw new Error(`NO BUTTON — body=${document.body.innerHTML.slice(0, 400)}`);
            }

            module.openPanel();
            expect(button.getAttribute('aria-expanded')).toBe('true');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(document.querySelector('.ai-assistant-panel')).toBeNull();
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('errors', () => {
        it('should display backend error messages', () => {
            createModule(false);

            errorHandler!(new Error('The API is unavailable'));

            expect(document.querySelector('.ai-assistant-error')?.textContent).toBe('The API is unavailable');
        });
    });
});
