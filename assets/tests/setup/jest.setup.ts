// Configuration pour Jest

// Empêcher les erreurs de console pendant les tests
global.console = {
    ...console,
    // Supprimer les logs en environnement de test
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

// Mock pour window.matchMedia (non disponible dans jsdom)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
