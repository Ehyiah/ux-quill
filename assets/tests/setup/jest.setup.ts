// Configuration globale pour Jest

// Mock pour les méthodes DOM qui ne sont pas implémentées dans JSDOM
Object.defineProperty(HTMLElement.prototype, 'addEventListener', {
  value: jest.fn(),
  configurable: true,
});

Object.defineProperty(HTMLElement.prototype, 'removeEventListener', {
  value: jest.fn(),
  configurable: true,
});

// Ajouter une méthode globale pour nettoyer les mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock pour les modules CSS
jest.mock('quill2-emoji/dist/style.css', () => ({}));

// Mock pour les autres modules qui posent problème
jest.mock('quill-resize-image', () => jest.fn());
jest.mock('quill2-emoji', () => ({}));
