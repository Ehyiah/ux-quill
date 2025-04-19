/**
 * Test très simple pour la méthode connect du controller Quill.
 * Nous testons uniquement que la méthode peut être appelée sans erreur
 * et que les événements sont correctement émis.
 */

// Mock global de Quill
jest.mock('quill', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'text-change') {
                callback();
            }
        }),
        root: {
            innerHTML: '<p>Test content</p>'
        }
    }));
});

// Mocks des dépendances
jest.mock('quill2-emoji', () => ({}));
jest.mock('quill-resize-image', () => ({}));
jest.mock('../src/imageUploader.ts', () => ({}));
jest.mock('../src/modules.ts', () => ({
    __esModule: true,
    default: jest.fn((a, b) => ({ ...a, ...b }))
}));
jest.mock('../src/upload-utils.ts', () => ({
    handleUploadResponse: jest.fn(),
    uploadStrategies: { ajax: jest.fn(), fetch: jest.fn() }
}));
/**
 * Test minimal pour vérifier que les mocks fonctionnent correctement
 */

// Mock simpliste pour Quill
const mockQuillInstance = {
    on: jest.fn((event, callback) => {
        if (event === 'text-change') callback();
    }),
    root: { innerHTML: '<p>Test content</p>' }
};

const mockQuill = jest.fn(() => mockQuillInstance);
mockQuill.register = jest.fn();
mockQuill.import = jest.fn().mockImplementation(name => {
    if (name === 'formats/image') {
        return {
            formats: jest.fn().mockReturnValue({}),
            prototype: { format: jest.fn() }
        };
    }
    return {};
});

// Mocker tous les modules externes
jest.mock('quill', () => mockQuill);
jest.mock('quill2-emoji', () => ({}));
jest.mock('quill-resize-image', () => ({}));
jest.mock('../src/imageUploader.ts', () => ({}));
jest.mock('../src/blots/image.ts', () => ({}));
jest.mock('../src/modules.ts', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((a, b) => ({ ...a, ...b }))
}));
jest.mock('../src/upload-utils.ts', () => ({
    handleUploadResponse: jest.fn(),
    uploadStrategies: { ajax: jest.fn(), fetch: jest.fn() }
}));

// Test simple
describe('Quill fonctionne avec les mocks', () => {
    test('Vérifier que les mocks de Quill fonctionnent', () => {
        // Importer Quill après les mocks
        const Quill = require('quill');

        // Vérifier que le mock fonctionne
        expect(Quill.register).toBeDefined();
        expect(Quill.import).toBeDefined();

        // Créer une instance
        const instance = new Quill();

        // Vérifier que l'instance a les méthodes attendues
        expect(instance.on).toBeDefined();
        expect(instance.root).toBeDefined();

        // Simuler un appel à on
        let called = false;
        instance.on('text-change', () => { called = true; });

        // Le callback devrait être appelé
        expect(called).toBe(true);
    });
});
import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';

describe('Test simple de Quill Controller', () => {
    // Mock de dispatch
    const mockDispatch = jest.fn();

    // Avant chaque test
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock de la méthode dispatch
        Controller.prototype.dispatch = mockDispatch;

        // Ajouter les méthodes statiques à Quill après l'import
        (Quill as any).register = jest.fn();
        (Quill as any).import = jest.fn().mockImplementation((name) => {
            if (name === 'formats/image') {
                return {
                    formats: jest.fn().mockReturnValue({}),
                    prototype: { format: jest.fn() }
                };
            }
            return {};
        });
    });

    test('Les événements sont dispatched lorsque connect est appelé', () => {
        // Importer le controller après avoir configuré tous les mocks
        const QuillController = require('../src/controller').default;

        // Créer les éléments DOM nécessaires
        const element = document.createElement('div');
        const input = document.createElement('input');
        const editor = document.createElement('div');

        // Créer une instance du controller
        const controller = new QuillController();

        // Configurer l'instance avec les cibles nécessaires
        controller.inputTarget = input;
        controller.editorContainerTarget = editor;

        // Définir les valeurs
        Object.defineProperties(controller, {
            'extraOptionsValue': {
                get: () => ({})
            },
            'toolbarOptionsValue': {
                get: () => []
            }
        });

        // Appeler la méthode connect
        controller.connect();

        // Vérifier que dispatch a été appelé avec les bons arguments
        expect(mockDispatch).toHaveBeenCalledWith(
            'options',
            expect.objectContaining({
                prefix: 'quill'
            })
        );

        expect(mockDispatch).toHaveBeenCalledWith(
            'connect',
            expect.objectContaining({
                prefix: 'quill'
            })
        );

        // Vérifier que la valeur de l'input a été mise à jour
        expect(input.value).toBe('<p>Test content</p>');
    });
});
