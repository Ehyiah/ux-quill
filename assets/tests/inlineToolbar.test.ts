import InlineToolbar from '../src/modules/inlineToolbar';
import { AiAssistantModule } from '../src/modules/aiAssistant/aiAssistantModule';
import type { AiManager } from '../src/modules/aiAssistant/aiManager';
import type { AiProvider } from '../src/modules/aiAssistant/aiTypes';

describe('InlineToolbar', () => {
    let mockQuill: any;
    let mockProvider: jest.Mocked<AiProvider>;
    let mockAiManager: jest.Mocked<AiManager>;
    let aiAssistantModule: AiAssistantModule;
    let container: HTMLDivElement;

    beforeEach(() => {
        document.body.innerHTML = '';

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
        } as unknown as jest.Mocked<AiManager>;

        container = document.createElement('div');
        const root = document.createElement('div');
        container.appendChild(root);
        document.body.appendChild(container);

        mockQuill = {
            on: jest.fn().mockImplementation((event: string, callback: (range: { index: number; length: number } | null) => void) => {
                if (event === 'selection-change') {
                    mockQuill.triggerSelectionChange = callback;
                }
                if (event === 'text-change') {
                    mockQuill.triggerTextChange = callback;
                }
            }),
            root,
            container,
            getBounds: jest.fn().mockReturnValue({ left: 100, top: 100, width: 50, height: 20 }),
            getSelection: jest.fn().mockReturnValue({ index: 0, length: 5 }),
            getFormat: jest.fn().mockReturnValue({}),
            format: jest.fn(),
            getModule: jest.fn().mockImplementation((name: string) => {
                if (name === 'aiAssistant') {
                    return aiAssistantModule;
                }
                return undefined;
            }),
        };

        aiAssistantModule = new AiAssistantModule(mockQuill, {
            aiManager: mockAiManager,
            features: { synonym: true },
            keyboardShortcut: false,
        });
    });

    afterEach(() => {
        document.querySelectorAll('.ai-assistant-backdrop').forEach(el => el.remove());
        document.querySelectorAll('.ai-assistant-panel').forEach(el => el.remove());
    });

    it('should render the aiAssistant button when included in buttons', async () => {
        new InlineToolbar(mockQuill, { buttons: ['bold', 'aiAssistant'] });

        mockQuill.triggerSelectionChange({ index: 0, length: 5 });

        await new Promise((resolve) => setTimeout(resolve, 20));

        const toolbar = container.querySelector('.ql-inline-toolbar');
        expect(toolbar).not.toBeNull();
        const buttons = toolbar!.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect(buttons[1].title).toBe('AI Assistant');
    });

    it('should open the AI panel below the inline toolbar button on click', async () => {
        new InlineToolbar(mockQuill, { buttons: ['bold', 'aiAssistant'] });

        mockQuill.triggerSelectionChange({ index: 0, length: 5 });

        await new Promise((resolve) => setTimeout(resolve, 20));

        const toolbar = container.querySelector('.ql-inline-toolbar') as HTMLElement;
        const aiButton = toolbar.querySelector('button[title="AI Assistant"]') as HTMLButtonElement;

        const mousedownEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
        });
        const preventDefault = jest.spyOn(mousedownEvent, 'preventDefault');
        const stopPropagation = jest.spyOn(mousedownEvent, 'stopPropagation');

        aiButton.dispatchEvent(mousedownEvent);

        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
        expect(document.querySelector('.ai-assistant-panel')).not.toBeNull();
    });

    it('should not render aiAssistant button when not included', async () => {
        new InlineToolbar(mockQuill, { buttons: ['bold', 'italic'] });

        mockQuill.triggerSelectionChange({ index: 0, length: 5 });

        await new Promise((resolve) => setTimeout(resolve, 20));

        const toolbar = container.querySelector('.ql-inline-toolbar') as HTMLElement;
        const aiButton = toolbar.querySelector('button[title="AI Assistant"]');
        expect(aiButton).toBeNull();
    });
});
