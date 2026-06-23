const MockQuill = jest.fn().mockImplementation(() => {
    return {
        on: jest.fn().mockImplementation((event, callback) => {
            if (event === 'text-change') {
                callback();
            }
        }),
        root: {
            innerHTML: '<p>Test content</p>'
        }
    };
});

// Propriétés statiques
MockQuill.register = jest.fn();
MockQuill.import = jest.fn().mockImplementation((name) => {
    if (name === 'formats/image' || name === 'formats/link') {
        return class MockFormat {
            static formats = jest.fn();
            static create = jest.fn();
            format = jest.fn();
        };
    }
    if (name.startsWith('attributors/style/')) {
        return {};
    }
    return {};
});

export default MockQuill;
