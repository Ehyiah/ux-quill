import SynonymModule from '../src/modules/synonym';

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

function createMockQuill(overrides: Record<string, any> = {}): any {
    const container = document.createElement('div');

    const defaults: Record<string, any> = {
        container,
        getModule: jest.fn().mockReturnValue(null),
        getSelection: jest.fn().mockReturnValue(null),
        getText: jest.fn().mockReturnValue(''),
        getLength: jest.fn().mockReturnValue(0),
        setSelection: jest.fn(),
        getBounds: jest.fn().mockReturnValue({ left: 100, top: 200, height: 20, width: 100 }),
        deleteText: jest.fn(),
        insertText: jest.fn(),
        getFormat: jest.fn().mockReturnValue({ bold: true }),
    };

    return { ...defaults, ...overrides };
}

function createToolbar(): { container: HTMLElement; getModule: jest.Mock } {
    const toolbar = { container: document.createElement('div') };
    const getModule = jest.fn().mockReturnValue(toolbar);
    return { container: toolbar.container, getModule };
}

describe('SynonymModule', () => {
    let mockQuill: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuill = createMockQuill();
    });

    describe('constructor', () => {
        it('devrait stocker les options fournies', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                locale: 'en',
                debug: true,
            });

            expect((module as any).provider).toBe('App\\Test\\Provider');
            expect((module as any).locale).toBe('en');
            expect((module as any).debug).toBe(true);
        });

        it('devrait utiliser les valeurs par défaut', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            expect((module as any).locale).toBe('en');
            expect((module as any).icon).toBe('🔄');
            expect((module as any).headerText).toBe('Look for synonyms');
            expect((module as any).showScore).toBe(false);
            expect((module as any).debug).toBe(false);
        });

        it('devrait accepter provider undefined sans planter', () => {
            expect(() => {
                new SynonymModule(mockQuill, {} as any);
            }).not.toThrow();
        });

        it('devrait stocker showScore quand fourni', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                showScore: true,
            });

            expect((module as any).showScore).toBe(true);
        });
    });

    describe('addToolbarButton', () => {
        it('devrait ajouter un bouton dans la toolbar', () => {
            jest.useFakeTimers();
            const { container, getModule } = createToolbar();
            mockQuill.getModule = getModule;

            new SynonymModule(mockQuill, { provider: 'App\\Test\\Provider' });

            jest.advanceTimersByTime(100);

            const btn = container.querySelector('.ql-synonym');
            expect(btn).not.toBeNull();
            expect(btn?.getAttribute('title')).toBe('Trouver un synonyme');
            jest.useRealTimers();
        });

        it('ne devrait pas planter si toolbar est absente', () => {
            mockQuill.getModule = jest.fn().mockReturnValue(null);

            expect(() => {
                new SynonymModule(mockQuill, { provider: 'App\\Test\\Provider' });
            }).not.toThrow();
        });
    });

    describe('getContext', () => {
        it('devrait extraire la phrase autour du mot', () => {
            mockQuill.getText.mockReturnValue('Ce projet est important pour nous.');
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            const context = (module as any).getContext({ index: 14, length: 9 });

            expect(context).toBe('Ce projet est important pour nous');
        });

        it('devrait retourner null pour un texte vide', () => {
            mockQuill.getText.mockReturnValue('');
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            const context = (module as any).getContext({ index: 0, length: 1 });

            expect(context).toBeNull();
        });
    });

    describe('showSynonyms — mot sélectionné', () => {
        it('devrait utiliser la sélection existante', async () => {
            mockQuill.getSelection.mockReturnValue({ index: 10, length: 5 });
            mockQuill.getText.mockImplementation((_index: number, length?: number) => {
                if (length && length > 0) return 'bonjour';
                return 'Ceci est un texte bonjour ici.';
            });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ word: 'salut', score: 0.9 }],
            });

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            await module.showSynonyms();

            expect(mockFetch).toHaveBeenCalledWith('/_ux/quill/synonyms', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"provider":"App\\\\Test\\\\Provider"'),
            }));

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.word).toBe('bonjour');
            expect(body.context).toContain('bonjour');
        });

        it('ne devrait rien faire si getSelection retourne null', async () => {
            mockQuill.getSelection.mockReturnValue(null);

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            await module.showSynonyms();

            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('showSynonyms — mot sous le curseur', () => {
        it('devrait détecter le mot sous le curseur', async () => {
            mockQuill.getSelection.mockReturnValue({ index: 23, length: 0 });
            mockQuill.getText.mockReturnValue('Ceci est un texte important ici.\n');
            mockQuill.getLength.mockReturnValue(33);
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ word: 'crucial', score: 0.95 }],
            });

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            await module.showSynonyms();

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.word).toBe('important');
            expect(mockQuill.setSelection).toHaveBeenCalledWith(18, 9, 'user');
        });

        it('ne devrait rien faire si aucun mot trouvé sous le curseur', async () => {
            mockQuill.getSelection.mockReturnValue({ index: 0, length: 0 });
            mockQuill.getText.mockReturnValue('   ');
            mockQuill.getLength.mockReturnValue(3);

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            await module.showSynonyms();

            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    describe('fetchSynonyms', () => {
        it('devrait appeler l\'endpoint avec le bon payload', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ word: 'salut', score: 0.9 }],
            });

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                locale: 'fr',
            });
            const result = await (module as any).fetchSynonyms('bonjour', 'Contexte ici');

            expect(mockFetch).toHaveBeenCalledWith('/_ux/quill/synonyms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'App\\Test\\Provider',
                    word: 'bonjour',
                    context: 'Contexte ici',
                    locale: 'fr',
                    providerOptions: {},
                }),
            });
            expect(result).toEqual([{ word: 'salut', score: 0.9 }]);
        });

        it('devrait lever une erreur HTTP', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Server error' }),
            });

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            await expect((module as any).fetchSynonyms('test', null)).rejects.toThrow('Server error');
        });
    });

    describe('openPopup', () => {
        it('devrait créer et afficher le popup', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                headerText: 'Synonymes pour',
            });
            (module as any).openPopup(
                [{ word: 'salut', score: 0.9 }, { word: 'coucou', score: 0.7 }],
                'bonjour',
                { index: 10, length: 7 },
            );

            const popup = mockQuill.container.querySelector('[role="dialog"]');
            expect(popup).not.toBeNull();
            expect(popup?.textContent).toContain('Synonymes pour');
            expect(popup?.textContent).toContain('bonjour');
        });

        it('devrait afficher "No Results" si la liste est vide', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                noSynonymText: 'Rien pour : {word}',
            });
            (module as any).openPopup([], 'xyz', { index: 0, length: 3 });

            const popup = mockQuill.container.querySelector('[role="dialog"]');
            expect(popup?.textContent).toContain('Rien pour : xyz');
        });

        it('devrait ne pas afficher le badge de score par défaut', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            (module as any).openPopup(
                [{ word: 'salut', score: 0.9 }],
                'bonjour',
                { index: 10, length: 7 },
            );

            const popup = mockQuill.container.querySelector('[role="dialog"]');
            expect(popup?.textContent).not.toContain('%');
        });

        it('devrait afficher le badge de score quand showScore est true', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
                showScore: true,
            });
            (module as any).openPopup(
                [{ word: 'salut', score: 0.9 }],
                'bonjour',
                { index: 10, length: 7 },
            );

            const popup = mockQuill.container.querySelector('[role="dialog"]');
            expect(popup?.textContent).toContain('90%');
        });

        it('devrait fermer le popup au clic sur le bouton fermer', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            (module as any).openPopup(
                [{ word: 'salut', score: 1.0 }],
                'bonjour',
                { index: 10, length: 7 },
            );

            const closeBtn = mockQuill.container.querySelector('[role="dialog"] button') as HTMLElement;
            closeBtn.click();

            expect(mockQuill.container.querySelector('[role="dialog"]')).toBeNull();
        });
    });

    describe('replaceText', () => {
        it('devrait remplacer le texte avec les formats conservés', () => {
            mockQuill.getFormat.mockReturnValue({ bold: true });

            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });
            (module as any).replaceText({ index: 10, length: 7 }, 'salut', true);

            expect(mockQuill.deleteText).toHaveBeenCalledWith(10, 7, 'user');
            expect(mockQuill.getFormat).toHaveBeenCalledWith(10, 7);
            expect(mockQuill.insertText).toHaveBeenCalledWith(10, 'salut', { bold: true }, 'user');
            expect(mockQuill.setSelection).toHaveBeenCalledWith(15, 0, 'user');
        });
    });

    describe('destroy', () => {
        it('devrait fermer le popup', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            (module as any).openPopup(
                [{ word: 'salut', score: 1.0 }],
                'bonjour',
                { index: 10, length: 7 },
            );
            module.destroy();

            expect(mockQuill.container.querySelector('[role="dialog"]')).toBeNull();
        });

        it('ne devrait pas planter si aucun popup ouvert', () => {
            const module = new SynonymModule(mockQuill, {
                provider: 'App\\Test\\Provider',
            });

            expect(() => module.destroy()).not.toThrow();
        });
    });
});
