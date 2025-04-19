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
    if (name === 'formats/image') {
        return {
            formats: jest.fn(),
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

export default MockQuill;
