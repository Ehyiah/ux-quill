import { Application } from '@hotwired/stimulus';
import QuillController from '../src/controller';
import Quill from 'quill';
import * as uploadUtils from '../src/upload-utils';
import mergeModules from '../src/modules';
import ImageUploader from '../src/imageUploader';

// Mocks
jest.mock('../src/modules', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    toolbar: [['bold', 'italic'], ['link']],
    imageUploader: {}
  })
}));
jest.mock('../src/upload-utils', () => ({
  handleUploadResponse: jest.fn(),
  uploadStrategies: {
    form: jest.fn(),
    json: jest.fn()
  }
}));
jest.mock('../src/imageUploader', () => jest.fn());

describe('QuillController', () => {
    let application: Application;
    let element: HTMLElement;
    let quillMock: any;

    beforeEach(() => {
        // Réinitialiser tous les mocks
        jest.clearAllMocks();

        // Créer le DOM nécessaire
        document.body.innerHTML = `
            <div data-controller="quill" 
                 data-quill-toolbar-options-value='[["bold", "italic"], ["link"]]' 
                 data-quill-extra-options-value='{"theme": "snow", "debug": false}'>
                <div data-quill-target="editorContainer"></div>
                <input data-quill-target="input" type="hidden">
            </div>
        `;

        element = document.querySelector('[data-controller="quill"]') as HTMLElement;

        // Configurer l'application Stimulus
        application = new Application();
        application.register('quill', QuillController);
    });

    describe('initialization', () => {
        test('enregistre correctement les modules Quill', () => {
            // Vérifier que register est appelé pour chaque module
            expect(Quill.register).toHaveBeenCalledWith('modules/imageUploader', expect.any(Function));
            expect(Quill.register).toHaveBeenCalledWith('modules/emoji', expect.any(Object));
            expect(Quill.register).toHaveBeenCalledWith('modules/resize', expect.any(Function));
        });

        test('initialise correctement l\'éditeur avec les options', () => {
            // Démarrer le contrôleur
            application.start();

            // Vérifier que Quill est appelé avec les bonnes options
            expect(Quill).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    theme: 'snow',
                    debug: false,
                    modules: expect.objectContaining({
                        toolbar: expect.any(Array)
                    })
                })
            );
        });
    });

        element = document.querySelector('[data-controller="quill"]') as HTMLElement;

        // Configurer les mocks Quill
        quillMock = {
            root: { innerHTML: '<p>Test</p>' },
            on: jest.fn(),
        };
        quillImportMock = jest.fn().mockImplementation((module) => {
            if (module === 'formats/image') {
                return {
                    formats: jest.fn(),
                    prototype: { format: jest.fn() }
                };
            }
            return module;
        });
        quillRegisterMock = jest.fn();

        (Quill as any).mockImplementation(() => quillMock);
        (Quill as any).import = quillImportMock;
        (Quill as any).register = quillRegisterMock;

        // Configurer Stimulus
        application = Application.start();
        application.register('quill', QuillController);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        application.stop();
    });

    describe('initialization', () => {
        test('enregistre correctement les modules Quill', () => {
            // Vérifie que les modules sont correctement enregistrés
            expect(quillRegisterMock).toHaveBeenCalledWith('modules/imageUploader', expect.anything());
            expect(quillRegisterMock).toHaveBeenCalledWith('modules/emoji', expect.anything());
            expect(quillRegisterMock).toHaveBeenCalledWith('modules/resize', expect.anything());
        });

        test('initialise correctement Quill lors de la connexion', () => {
            // Vérifier que Quill est initialisé avec les bonnes options
            expect(Quill).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                expect.objectContaining({
                    theme: 'snow',
                    debug: false
                })
            );
        });
    });

    describe('buildQuillOptions', () => {
        test('construit les options Quill avec les valeurs par défaut', () => {
            (mergeModules as jest.Mock).mockReturnValue({ toolbar: [['bold', 'italic'], ['link']] });

            // Accéder au contrôleur directement
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            // Appeler la méthode directement
            const options = controller['buildQuillOptions']();

            // Vérifier que les options sont correctement construites
            expect(options).toEqual(expect.objectContaining({
                theme: 'snow',
                debug: false,
                modules: expect.anything()
            }));

            expect(mergeModules).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    toolbar: expect.anything()
                })
            );
        });
    });

    describe('setupUploadHandler', () => {
        test('configure correctement la gestion des téléchargements', () => {
            // Simuler la stratégie de téléchargement
            (uploadUtils.uploadStrategies as any) = {
                xhr: jest.fn().mockResolvedValue({ data: { link: 'image-url.jpg' } })
            };

            // Mettre à jour les options du contrôleur avec un gestionnaire de téléchargement
            element.setAttribute(
                'data-quill-extra-options-value',
                JSON.stringify({
                    upload_handler: {
                        type: 'xhr',
                        upload_endpoint: '/upload',
                        json_response_file_path: 'data.link'
                    }
                })
            );

            const options = { modules: {} };

            // Accéder au contrôleur directement
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            controller['setupUploadHandler'](options);

            // Vérifier que le gestionnaire de téléchargement est configuré correctement
            expect(options.modules).toHaveProperty('imageUploader');
            expect(options.modules.imageUploader).toHaveProperty('upload');

            // Tester la fonction de téléchargement
            const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
            const uploadFn = options.modules.imageUploader.upload;

            (uploadUtils.handleUploadResponse as jest.Mock).mockReturnValue('image-url.jpg');

            return uploadFn(file).then((result: string) => {
                expect(result).toBe('image-url.jpg');
                expect(uploadUtils.uploadStrategies.xhr).toHaveBeenCalledWith('/upload', file);
                expect(uploadUtils.handleUploadResponse).toHaveBeenCalled();
            });
        });
    });

    describe('setupContentSync', () => {
        test('synchronise le contenu de Quill avec la valeur de l\'input cible', () => {
            // Accéder au contrôleur directement
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            controller['setupContentSync'](quillMock);

            // Simuler un changement de texte
            const onTextChange = quillMock.on.mock.calls.find(
                (call: any[]) => call[0] === 'text-change'
            )[1];

            onTextChange();

            // Vérifier que la valeur de l'input est mise à jour
            const input = element.querySelector('[data-quill-target="input"]') as HTMLInputElement;
            expect(input.value).toBe('<p>Test</p>');
        });
    });

    describe('setupEditorHeight', () => {
        test('configure correctement la hauteur de l\'éditeur', () => {
            // Mettre à jour les options du contrôleur avec une hauteur spécifique
            element.setAttribute(
                'data-quill-extra-options-value',
                JSON.stringify({ height: '300px' })
            );

            // Accéder au contrôleur directement
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            controller['setupEditorHeight']();

            // Vérifier que la hauteur est correctement définie
            const editorContainer = element.querySelector(
                '[data-quill-target="editorContainer"]'
            ) as HTMLElement;

            expect(editorContainer.style.height).toBe('300px');
        });
    });

    describe('dispatchEvent', () => {
        test('dispatche correctement des événements personnalisés', () => {
            // Espionner la méthode dispatch
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            const dispatchSpy = jest.spyOn(controller, 'dispatch');

            // Appeler dispatchEvent
            controller['dispatchEvent']('test', { foo: 'bar' });

            // Vérifier que dispatch a été appelé avec les bons arguments
            expect(dispatchSpy).toHaveBeenCalledWith(
                'test',
                {
                    detail: { foo: 'bar' },
                    prefix: 'quill'
                }
            );
        });
    });

    describe('integration', () => {
        test('le flux complet d\'initialisation fonctionne correctement', () => {
            // Simuler mergeModules pour retourner un objet modules valide
            (mergeModules as jest.Mock).mockReturnValue({ toolbar: [['bold', 'italic'], ['link']] });

            // Espionner les méthodes privées
            const controller = (application.getControllerForElementAndIdentifier(
                element,
                'quill'
            ) as unknown) as QuillController;

            const buildOptionsSpy = jest.spyOn(controller as any, 'buildQuillOptions');
            const setupStylesSpy = jest.spyOn(controller as any, 'setupQuillStyles');
            const setupUploadSpy = jest.spyOn(controller as any, 'setupUploadHandler');
            const setupHeightSpy = jest.spyOn(controller as any, 'setupEditorHeight');
            const setupContentSpy = jest.spyOn(controller as any, 'setupContentSync');
            const dispatchEventSpy = jest.spyOn(controller as any, 'dispatchEvent');

            // Appeler connect manuellement pour tester le flux complet
            controller.connect();

            // Vérifier que toutes les méthodes d'initialisation sont appelées dans l'ordre
            expect(buildOptionsSpy).toHaveBeenCalled();
            expect(setupStylesSpy).toHaveBeenCalled();
            expect(setupUploadSpy).toHaveBeenCalled();
            expect(setupHeightSpy).toHaveBeenCalled();
            expect(dispatchEventSpy).toHaveBeenCalledWith('options', expect.anything());
            expect(Quill).toHaveBeenCalled();
            expect(setupContentSpy).toHaveBeenCalled();
            expect(dispatchEventSpy).toHaveBeenCalledWith('connect', expect.anything());
        });
    });
});
