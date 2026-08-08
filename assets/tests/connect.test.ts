import { Application, Controller } from '@hotwired/stimulus';
import QuillController from '../src/controller';

// --- Mocks ---

// Mock Quill
jest.mock('quill', () => {
    const mockQuillInstance = {
        on: jest.fn((event, callback) => {
            if (event === 'text-change') {
                callback();
            }
        }),
        root: {
            innerHTML: '<p>Test content</p>',
            addEventListener: jest.fn(),
        },
        clipboard: {
            convert: jest.fn().mockReturnValue({ ops: [] })
        },
        updateContents: jest.fn(),
        getModule: jest.fn().mockImplementation((name) => {
            if (name === 'toolbar') {
                return { addHandler: jest.fn() };
            }
            return {};
        }),
        container: {
            getBoundingClientRect: jest.fn().mockReturnValue({ top: 0, left: 0, width: 100, height: 100 })
        },
        getSelection: jest.fn(),
        getSemanticHTML: jest.fn().mockReturnValue('<p>Test content</p>'),
        deleteText: jest.fn(),
        insertEmbed: jest.fn(),
        insertText: jest.fn(),
        setSelection: jest.fn(),
        getLine: jest.fn(),
        getIndex: jest.fn(),
        getText: jest.fn(),
        getBounds: jest.fn(),
    };

    const MockQuill = jest.fn().mockImplementation(() => mockQuillInstance);

    // @ts-ignore
    MockQuill.register = jest.fn();

    // @ts-ignore
    MockQuill.import = jest.fn().mockImplementation((name) => {
        // Return a dummy Blot class
        return class MockBlot {
            static blotName = 'mock';
            static tagName = 'div';
            static create() { return document.createElement('div'); }
            static value() { return {}; }
            static formats() { return {}; }
            format() {}
        };
    });

    return {
        __esModule: true,
        default: MockQuill,
    };
});

// Mock dependencies
jest.mock('../src/modules.ts', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((moduleOptions, enabledModules) => {
        return { ...moduleOptions, ...enabledModules };
    })
}));

// IMPORTANT: Mock both the Blot and the Module for Mention
// This prevents the real code in src/blots/mention.ts from running and trying to extend a real Quill Blot
jest.mock('../src/blots/mention.ts', () => {
    return {
        __esModule: true,
        default: class MockMentionBlot {
            static blotName = 'mention';
            static tagName = 'span';
        }
    };
});
jest.mock('../src/modules/mention.ts', () => ({
    Mention: jest.fn()
}));

// IMPORTANT: Mock ImageFigure to avoid inheritance issues
jest.mock('../src/blots/imageFigure.ts', () => {
    return {
        __esModule: true,
        default: class MockImageFigure {
            static blotName = 'image';
            static tagName = 'figure';
        }
    };
});

jest.mock('quill-table-better', () => ({
    QuillTableBetter: jest.fn()
}));

jest.mock('quill2-emoji', () => ({}));
jest.mock('../src/imageUploader.ts', () => ({}));
jest.mock('../src/register-modules.ts', () => ({}));
jest.mock('../src/upload-utils.ts', () => ({
    handleUploadResponse: jest.fn(),
    uploadStrategies: {
        ajax: jest.fn(),
        fetch: jest.fn()
    }
}));

// Mock Controller dispatch
const mockDispatch = jest.fn();
Controller.prototype.dispatch = mockDispatch;

// --- Tests ---

describe('QuillController - méthode connect', () => {
    let application: Application;
    let controller: QuillController;
    let element: HTMLElement;
    let inputElement: HTMLInputElement;
    let editorElement: HTMLDivElement;
    let Quill: any;

    beforeEach(() => {
        jest.clearAllMocks();

        Quill = require('quill');

        // Créer le DOM pour les tests
        element = document.createElement('div');
        element.setAttribute('data-controller', 'quill');

        // Créer l'input cible
        inputElement = document.createElement('input');
        inputElement.setAttribute('data-quill-target', 'input');
        element.appendChild(inputElement);

        // Créer le container de l'éditeur
        editorElement = document.createElement('div');
        editorElement.setAttribute('data-quill-target', 'editorContainer');
        element.appendChild(editorElement);

        // Ajouter au document
        document.body.appendChild(element);

        // Initialiser Stimulus correctement
        application = new Application();
        application.register('quill', QuillController);
        application.start();

        // Récupérer l'instance du controller
        controller = application.getControllerForElementAndIdentifier(
            element,
            'quill'
        ) as unknown as QuillController;
    });

    afterEach(() => {
        document.body.removeChild(element);
        application.stop();
    });

    describe('connect', () => {
        it('devrait initialiser Quill correctement et dispatcher des événements', () => {
            // Wait for next tick to ensure async operations complete
            return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    'options',
                    expect.objectContaining({
                        detail: expect.any(Object),
                        prefix: 'quill'
                    })
                );

                expect(mockDispatch).toHaveBeenCalledWith(
                    'connect',
                    expect.objectContaining({
                        detail: expect.any(Object),
                        prefix: 'quill'
                    })
                );

                // Check that the input value was updated (via the mock text-change event)
                expect(inputElement.value).toBe('<p>Test content</p>');
            });
        });
    });
});
