import ImageUploader from '../src/imageUploader';
import Quill from 'quill';
import LoadingImage from '../src/blots/image';

// Mock pour le module image
jest.mock('../src/blots/image', () => ({
    blotName: 'loading-image'
}));

describe('ImageUploader', () => {
    let quillMock: any;
    let uploader: ImageUploader;
    let uploadFn: jest.Mock;
    let file: File;

    beforeEach(() => {
        // Réinitialiser tous les mocks
        jest.clearAllMocks();

        // Définir un fichier de test
        file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

        // Configurer les mocks Quill
        quillMock = {
            root: document.createElement('div'),
            getSelection: jest.fn().mockReturnValue({ index: 5, length: 0 }),
            insertEmbed: jest.fn().mockReturnValue({ ops: [{ insert: 'image' }] }),
            deleteText: jest.fn(),
            setSelection: jest.fn(),
            focus: jest.fn(),
            getModule: jest.fn().mockImplementation((name) => {
                if (name === 'toolbar') {
                    return { addHandler: jest.fn() };
                }
                return null;
            })
        };

        // Fonction de téléchargement mock
        uploadFn = jest.fn().mockResolvedValue('https://example.com/uploaded-image.jpg');

        // Créer l'instance d'ImageUploader
        uploader = new ImageUploader(quillMock, { upload: uploadFn });

        // Mock pour document.body.appendChild et removeChild
        Object.defineProperty(document.body, 'appendChild', {
            value: jest.fn(),
            configurable: true
        });
        Object.defineProperty(document.body, 'removeChild', {
            value: jest.fn(),
            configurable: true
        });

        // Mock pour window.requestAnimationFrame
        window.requestAnimationFrame = jest.fn().mockImplementation((callback) => {
            callback();
            return 0;
        });
    });

    describe('constructor', () => {
        test('initialise correctement l\'uploader et ajoute les écouteurs', () => {
            // Vérifier que les écouteurs sont ajoutés à root
            expect(quillMock.root.addEventListener).toHaveBeenCalledWith(
                'drop',
                expect.any(Function),
                false
            );
            expect(quillMock.root.addEventListener).toHaveBeenCalledWith(
                'paste',
                expect.any(Function),
                false
            );

            // Vérifier que le gestionnaire d'images est ajouté à la barre d'outils
            const toolbar = quillMock.getModule('toolbar');
            expect(toolbar.addHandler).toHaveBeenCalledWith('image', expect.any(Function));
        });

        test('affiche un avertissement si la fonction upload n\'est pas définie', () => {
            // Espionner console.warn
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Créer un uploader sans fonction de téléchargement
            new ImageUploader(quillMock, {});

            // Vérifier que l'avertissement est affiché
            expect(warnSpy).toHaveBeenCalledWith(
                '[Missing config] upload function that returns a promise is required'
            );

            warnSpy.mockRestore();
        });
    });

    describe('selectLocalImage', () => {
        test('crée et déclenche un sélecteur de fichier', () => {
            // Appeler la méthode
            uploader.selectLocalImage();

            // Vérifier que le focus est mis sur l'éditeur
            expect(quillMock.focus).toHaveBeenCalled();

            // Vérifier que getSelection est appelé
            expect(quillMock.getSelection).toHaveBeenCalled();

            // Vérifier que l'élément input est créé avec les bonnes propriétés
            expect(document.body.appendChild).toHaveBeenCalledWith(expect.any(HTMLInputElement));

            // Vérifier que click est appelé sur l'input
            const fileInput = (document.body.appendChild as jest.Mock).mock.calls[0][0];
            expect(fileInput.type).toBe('file');
            expect(fileInput.accept).toBe('image/*');

            // Simuler un onchange
            Object.defineProperty(fileInput, 'files', {
                value: [file],
                configurable: true
            });

            // Espionner la méthode fileChanged
            const fileChangedSpy = jest.spyOn(uploader, 'fileChanged');

            // Déclencher l'événement change
            fileInput.onchange && fileInput.onchange({} as Event);

            // Vérifier que fileChanged est appelé
            expect(fileChangedSpy).toHaveBeenCalled();

            // Vérifier que l'input est supprimé
            expect(document.body.removeChild).toHaveBeenCalled();
        });
    });

    describe('readAndUploadFile', () => {
        test('lit le fichier et appelle la fonction de téléchargement', () => {
            // Espionner FileReader
            const readAsDataURLSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');
            const insertBase64Spy = jest.spyOn(uploader, 'insertBase64Image').mockImplementation();
            const insertToEditorSpy = jest.spyOn(uploader, 'insertToEditor').mockImplementation();

            // Appeler la méthode
            uploader.readAndUploadFile(file);

            // Vérifier que readAsDataURL est appelé avec le fichier
            expect(readAsDataURLSpy).toHaveBeenCalledWith(file);

            // Simuler un événement load sur le FileReader
            const reader = readAsDataURLSpy.mock.instances[0] as FileReader;
            Object.defineProperty(reader, 'result', {
                value: 'data:image/jpeg;base64,test',
                configurable: true
            });

            // Déclencher l'événement load
            const loadEvent = new Event('load');
            reader.dispatchEvent(loadEvent);

            // Vérifier que insertBase64Image est appelé avec le résultat
            expect(insertBase64Spy).toHaveBeenCalledWith('data:image/jpeg;base64,test');

            // Vérifier que la fonction de téléchargement est appelée
            expect(uploadFn).toHaveBeenCalledWith(file);

            // Simuler la résolution de la promesse de téléchargement
            return uploadFn.mock.results[0].value.then(() => {
                // Vérifier que insertToEditor est appelé avec l'URL
                expect(insertToEditorSpy).toHaveBeenCalledWith('https://example.com/uploaded-image.jpg');
            });
        });

        test('gère correctement les erreurs de téléchargement', () => {
            // Configurer la fonction de téléchargement pour rejeter
            uploadFn.mockRejectedValue(new Error('Upload failed'));

            // Espionner les méthodes
            const removeBase64Spy = jest.spyOn(uploader, 'removeBase64Image').mockImplementation();
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

            // Appeler la méthode
            return uploader.readAndUploadFile(file).then(() => {
                // Ne devrait pas arriver car la promesse est rejetée
                expect(true).toBe(false);
            }).catch(() => {
                // Vérifier que removeBase64Image est appelé
                expect(removeBase64Spy).toHaveBeenCalled();
                // Vérifier que l'erreur est enregistrée
                expect(warnSpy).toHaveBeenCalledWith(expect.any(Error));
            });
        });
    });

    describe('insertBase64Image et insertToEditor', () => {
        test('insère correctement une image base64 temporaire puis la remplace par l\'image définitive', () => {
            // Configurer le range
            uploader.range = { index: 10, length: 0 };

            // Appeler insertBase64Image
            uploader.insertBase64Image('data:image/jpeg;base64,test');

            // Vérifier que insertEmbed est appelé avec les bons arguments
            expect(quillMock.insertEmbed).toHaveBeenCalledWith(
                10,
                LoadingImage.blotName,
                'data:image/jpeg;base64,test',
                'user'
            );

            // Appeler insertToEditor
            uploader.insertToEditor('https://example.com/final-image.jpg');

            // Vérifier que deleteText est appelé pour supprimer l'image temporaire
            expect(quillMock.deleteText).toHaveBeenCalledWith(10, 1, 'user');

            // Vérifier que insertEmbed est appelé pour insérer l'image définitive
            expect(quillMock.insertEmbed).toHaveBeenCalledWith(
                10,
                'image',
                'https://example.com/final-image.jpg',
                'user'
            );

            // Vérifier que setSelection est appelé pour placer le curseur après l'image
            expect(quillMock.setSelection).toHaveBeenCalledWith(
                { index: 11, length: 0 },
                'user'
            );
        });
    });

    describe('handleDrop', () => {
        test('gère correctement le dépôt d\'un fichier image', () => {
            // Créer un événement de dépôt
            const dropEvent = {
                dataTransfer: {
                    files: [file]
                },
                clientX: 100,
                clientY: 100,
                stopPropagation: jest.fn(),
                preventDefault: jest.fn()
            } as unknown as DragEvent;

            // Espionner readAndUploadFile
            const readAndUploadSpy = jest.spyOn(uploader, 'readAndUploadFile').mockImplementation();

            // Appeler la méthode
            uploader.handleDrop(dropEvent);

            // Vérifier que stopPropagation et preventDefault sont appelés
            expect(dropEvent.stopPropagation).toHaveBeenCalled();
            expect(dropEvent.preventDefault).toHaveBeenCalled();

            // Vérifier que focus est appelé
            expect(quillMock.focus).toHaveBeenCalled();

            // Vérifier que readAndUploadFile est appelé avec le fichier
            setTimeout(() => {
                expect(readAndUploadSpy).toHaveBeenCalledWith(file);
            }, 0);
        });
    });

    describe('handlePaste', () => {
        test('gère correctement le collage d\'un fichier image', () => {
            // Créer un événement de collage
            const pasteEvent = {
                clipboardData: {
                    items: [{
                        type: 'image/jpeg',
                        getAsFile: () => file
                    }]
                },
                preventDefault: jest.fn()
            } as unknown as ClipboardEvent;

            // Espionner readAndUploadFile
            const readAndUploadSpy = jest.spyOn(uploader, 'readAndUploadFile').mockImplementation();

            // Appeler la méthode
            uploader.handlePaste(pasteEvent);

            // Vérifier que preventDefault est appelé
            expect(pasteEvent.preventDefault).toHaveBeenCalled();

            // Vérifier que focus est appelé
            expect(quillMock.focus).toHaveBeenCalled();

            // Vérifier que readAndUploadFile est appelé avec le fichier
            setTimeout(() => {
                expect(readAndUploadSpy).toHaveBeenCalledWith(file);
            }, 0);
        });
    });
});
