import Quill from 'quill';

jest.mock('quill', () => {
    const mockIcons: Record<string, string> = {};

    const mockQuillInstance = {
        getModule: jest.fn().mockReturnValue(null),
        getSelection: jest.fn(),
        insertText: jest.fn(),
        setSelection: jest.fn(),
    };

    const MockQuill = jest.fn().mockImplementation(() => mockQuillInstance);
    MockQuill.register = jest.fn();
    MockQuill.import = jest.fn().mockImplementation((name: string) => {
        if (name === 'ui/icons') {
            return mockIcons;
        }
        return {};
    });

    return {
        __esModule: true,
        default: MockQuill,
    };
});

import { PlaceholderModule } from '../src/modules/placeHolderModule/placeHolderModule';

describe('PlaceholderModule', () => {
    let mockQuill: any;
    let mockIcons: Record<string, string>;

    beforeEach(() => {
        jest.clearAllMocks();
        document.querySelectorAll('#ql-placeholder-styles').forEach((el) => el.remove());
        mockQuill = new (Quill as any)();
        mockIcons = (Quill as any).import('ui/icons') as Record<string, string>;
    });

    describe('constructeur', () => {
        it('devrait injecter les styles dans le head', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            const style = document.getElementById('ql-placeholder-styles');
            expect(style).not.toBeNull();
            expect(style?.tagName).toBe('STYLE');
            expect(style?.innerHTML).toContain('.ql-placeholder');
            expect(style?.innerHTML).toContain('.ql-placeholder-dropdown');
        });

        it('ne devrait pas recréer le style sil existe déjà (idempotent)', () => {
            const style = document.createElement('style');
            style.id = 'ql-placeholder-styles';
            document.head.appendChild(style);

            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            const styles = document.querySelectorAll('#ql-placeholder-styles');
            expect(styles.length).toBe(1);
        });

        it('devrait enregistrer licône par défaut dans le registre Quill', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            expect(mockIcons['placeholder']).toBeDefined();
            expect(mockIcons['placeholder']).toContain('<svg');
        });

        it('devrait remplacer licône si une icône personnalisée est fournie', () => {
            new PlaceholderModule(mockQuill, {
                placeholders: ['firstName'],
                icon: '<svg>custom</svg>',
            });
            expect(mockIcons['placeholder']).toBe('<svg>custom</svg>');
        });

        it('devrait récupérer le module toolbar via quill.getModule', () => {
            const toolbar = { container: document.createElement('div') };
            mockQuill.getModule.mockReturnValue(toolbar);

            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            expect(mockQuill.getModule).toHaveBeenCalledWith('toolbar');
        });

        it('ne devrait pas planter si le module toolbar est absent', () => {
            mockQuill.getModule.mockReturnValue(null);
            expect(() => {
                new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            }).not.toThrow();
        });
    });

    describe('addButton (via constructeur avec toolbar)', () => {
        let toolbar: any;
        let module: PlaceholderModule;

        beforeEach(() => {
            toolbar = { container: document.createElement('div') };
            mockQuill.getModule.mockReturnValue(toolbar);
        });

        it('devrait créer le bouton avec la classe ql-placeholder', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            const btn = toolbar.container.querySelector('.ql-placeholder');
            expect(btn).not.toBeNull();
            expect(btn?.getAttribute('aria-label')).toBe('placeholder');
        });

        it('devrait créer le dropdown avec la classe ql-placeholder-dropdown', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            const dropdown = toolbar.container.querySelector('.ql-placeholder-dropdown');
            expect(dropdown).not.toBeNull();
            expect((dropdown as HTMLElement).style.display).toBe('none');
        });

        it('devrait créer un élément .ql-formats si absent', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            const formats = toolbar.container.querySelector('.ql-formats');
            expect(formats).not.toBeNull();
        });

        it('devrait créer un item par placeholder dans le dropdown', () => {
            const placeholders = ['firstName', 'lastName', 'email'];
            new PlaceholderModule(mockQuill, { placeholders });
            const items = toolbar.container.querySelectorAll('.ql-placeholder-item');
            expect(items.length).toBe(3);
            expect(items[0].innerHTML).toBe('firstName');
            expect(items[1].innerHTML).toBe('lastName');
            expect(items[2].innerHTML).toBe('email');
        });

        it('ne devrait pas créer ditems si placeholders est vide', () => {
            new PlaceholderModule(mockQuill, { placeholders: [] });
            const items = toolbar.container.querySelectorAll('.ql-placeholder-item');
            expect(items.length).toBe(0);
        });

        it('devrait ajouter un écouteur de clic global sur le document pour fermer le dropdown', () => {
            const spy = jest.spyOn(document, 'addEventListener');
            new PlaceholderModule(mockQuill, { placeholders: ['firstName'] });
            expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
            spy.mockRestore();
        });

        it('le clic sur le bouton de la toolbar devrait afficher/masquer le dropdown', () => {
            module = new PlaceholderModule(mockQuill, { placeholders: ['test'] });
            const btn = toolbar.container.querySelector('.ql-placeholder') as HTMLElement;
            const dropdown = toolbar.container.querySelector('.ql-placeholder-dropdown') as HTMLElement;

            btn.click();
            expect(dropdown.style.display).toBe('block');

            btn.click();
            expect(dropdown.style.display).toBe('none');
        });

        it('le clic sur un item du dropdown devrait insérer le placeholder et fermer le dropdown', () => {
            mockQuill.getSelection.mockReturnValue({ index: 5 });
            new PlaceholderModule(mockQuill, { placeholders: ['email'] });
            const btn = toolbar.container.querySelector('.ql-placeholder') as HTMLElement;
            btn.click();

            const item = toolbar.container.querySelector('.ql-placeholder-item') as HTMLElement;
            item.click();

            expect(mockQuill.insertText).toHaveBeenCalledWith(5, '{{email}}');
            expect(mockQuill.setSelection).toHaveBeenCalledWith(14, 0);
        });

        it('le clic hors du dropdown ou du bouton ferme le dropdown', () => {
            module = new PlaceholderModule(mockQuill, { placeholders: ['test'] });
            const btn = toolbar.container.querySelector('.ql-placeholder') as HTMLElement;
            btn.click();

            const dropdown = toolbar.container.querySelector('.ql-placeholder-dropdown') as HTMLElement;
            expect(dropdown.style.display).toBe('block');

            document.body.click();
            expect(dropdown.style.display).toBe('none');
        });
    });

    describe('insertPlaceholder', () => {
        it('devrait insérer le texte avec les tags par défaut', () => {
            mockQuill.getSelection.mockReturnValue({ index: 3 });
            const module = new PlaceholderModule(mockQuill, { placeholders: ['test'] });
            (module as any).insertPlaceholder('firstName');
            expect(mockQuill.insertText).toHaveBeenCalledWith(3, '{{firstName}}');
            expect(mockQuill.setSelection).toHaveBeenCalledWith(16, 0);
        });

        it('devrait utiliser les tags personnalisés', () => {
            mockQuill.getSelection.mockReturnValue({ index: 0 });
            const module = new PlaceholderModule(mockQuill, {
                placeholders: ['test'],
                startTag: '[[',
                endTag: ']]',
            });
            (module as any).insertPlaceholder('email');
            expect(mockQuill.insertText).toHaveBeenCalledWith(0, '[[email]]');
        });

        it('ne devrait rien faire si getSelection retourne null', () => {
            mockQuill.getSelection.mockReturnValue(null);
            const module = new PlaceholderModule(mockQuill, { placeholders: ['test'] });
            (module as any).insertPlaceholder('firstName');
            expect(mockQuill.insertText).not.toHaveBeenCalled();
        });
    });

    describe('injectStyles', () => {
        it('devrait contenir les règles CSS essentielles', () => {
            new PlaceholderModule(mockQuill, { placeholders: ['test'] });
            const style = document.getElementById('ql-placeholder-styles') as HTMLStyleElement;
            const css = style.innerHTML;

            expect(css).toContain('.ql-placeholder');
            expect(css).toContain('.ql-placeholder-dropdown');
            expect(css).toContain('.ql-placeholder-item');
            expect(css).toContain('.ql-placeholder-item:hover');
        });
    });
});
