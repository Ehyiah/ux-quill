import { Application, Controller } from '@hotwired/stimulus';
import QuillController from '../src/controller';

// Capturer les appels à new Quill()
const mockQuillInstance = {
    on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'text-change') {
            callback();
        }
    }),
    root: {
        innerHTML: '<p>Test content</p>'
    },
    clipboard: {
        convert: jest.fn().mockReturnValue({ ops: [] })
    },
    updateContents: jest.fn(),
    getModule: jest.fn().mockImplementation((name) => {
        if (name === 'toolbar') {
            return {
                addHandler: jest.fn()
            };
        }
        return {};
    })
};

// Les mocks doivent être définis avant l'import du module à tester
jest.mock('quill', () => {
    // Mock de base pour les Blots
    class MockBlot {
        static create() { return document.createElement('div'); }
        static value() { return {}; }
        static formats() { return {}; }
        format() {}
    }

    // Mock Quill en tant que fonction constructeur avec des méthodes statiques
    const mockQuill = jest.fn().mockImplementation(() => mockQuillInstance);

    // Ajouter les méthodes statiques au mock
    mockQuill.register = jest.fn();
    mockQuill.import = jest.fn().mockImplementation((name) => {
        if (name === 'formats/image') {
            return MockBlot;
        }
        if (name === 'blots/block/embed') {
            return MockBlot;
        }
        if (name === 'blots/block') {
            return MockBlot;
        }
        if (name === 'blots/embed') {
            return MockBlot;
        }
        if (name === 'blots/inline') {
            return MockBlot;
        }
        if (name.startsWith('attributors/style/')) {
            return {};
        }
        return {};
    });

    return {
        __esModule: true,
        default: mockQuill,
    };
});

// Mock du module de fusion
jest.mock('../src/modules.ts', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((moduleOptions, enabledModules) => {
        return { ...moduleOptions, ...enabledModules };
    })
}));

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

// Mock de la méthode dispatch du Controller
const mockDispatch = jest.fn();
Controller.prototype.dispatch = mockDispatch;

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

                expect(inputElement.value).toBe('<p>Test content</p>');
            });
        });
    });
});
