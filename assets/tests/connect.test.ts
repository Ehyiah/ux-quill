import { Application, Controller } from '@hotwired/stimulus';
import QuillController from '../src/controller';

// Les mocks doivent être définis avant l'import du module à tester
jest.mock('quill', () => {
    // Mock Quill en tant que fonction constructeur avec des méthodes statiques
    const mockQuill = jest.fn().mockImplementation(() => ({
        on: jest.fn().mockImplementation((event, callback) => {
            if (event === 'text-change') {
                callback();
            }
        }),
        root: {
            innerHTML: '<p>Test content</p>'
        }
    }));

    // Ajouter les méthodes statiques au mock
    mockQuill.register = jest.fn();
    mockQuill.import = jest.fn().mockImplementation((name) => {
        if (name === 'formats/image') {
            return {
                formats: jest.fn().mockReturnValue({}),
                prototype: {
                    format: jest.fn()
                }
            };
        }
        if (name.startsWith('attributors/style/')) {
            return {};
        }
        return {};
    });

    return mockQuill;
});

// Autres mocks
jest.mock('quill2-emoji', () => ({}));
jest.mock('quill-resize-image', () => ({}));
jest.mock('../src/imageUploader.ts', () => ({}));
jest.mock('../src/modules.ts', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((moduleOptions, enabledModules) => {
        return { ...moduleOptions, ...enabledModules };
    })
}));
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

    beforeEach(() => {
        // Réinitialiser les mocks
        jest.clearAllMocks();

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
        // Nettoyer le DOM
        document.body.removeChild(element);
        application.stop();
    });

    test('devrait initialiser Quill et synchroniser le contenu', () => {
        // Pas besoin d'appeler connect car il est appelé automatiquement lors de l'initialisation du contrôleur

        // Vérifier que les événements ont été dispatched
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

        // Vérifier que la valeur de l'input a été mise à jour
        expect(inputElement.value).toBe('<p>Test content</p>');
    });
});
