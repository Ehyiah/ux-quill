// Mock pour Quill
const quillInstance = {
  root: { innerHTML: '<p>Test</p>' },
  on: jest.fn(),
  getSelection: jest.fn(),
  insertEmbed: jest.fn(),
  deleteText: jest.fn(),
  setSelection: jest.fn(),
  getModule: jest.fn().mockImplementation((name) => {
    if (name === 'toolbar') {
      return { addHandler: jest.fn() };
    }
    return null;
  })
};

const Quill = jest.fn().mockImplementation(() => quillInstance);

// Mock pour les formats/images
const imageModule = {
  formats: jest.fn(),
  prototype: { format: jest.fn() }
};

// Mock pour les méthodes statiques
Quill.import = jest.fn().mockImplementation((module) => {
  if (module === 'formats/image') {
    return imageModule;
  }
  if (module.startsWith('attributors/style/')) {
    return {};
  }
  return module;
});

// Mock pour l'enregistrement des modules
Quill.register = jest.fn();

// Exports supplémentaires pour les tests
Quill.mockInstance = quillInstance;
Quill.mockImageModule = imageModule;

export default Quill;
