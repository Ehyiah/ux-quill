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

class MockBlockEmbed {
    static blotName = 'mock-embed';
    static tagName = 'div';
    static className: string;
    static create(value?: any): HTMLElement {
        const node = document.createElement(this.tagName);
        if (this.className) {
            node.classList.add(this.className);
        }
        return node;
    }
    static value(node: HTMLElement): any {
        return {};
    }
}

// Propriétés statiques
MockQuill.register = jest.fn();
MockQuill.import = jest.fn().mockImplementation((name) => {
    if (name === 'blots/block/embed') {
        return MockBlockEmbed;
    }
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
