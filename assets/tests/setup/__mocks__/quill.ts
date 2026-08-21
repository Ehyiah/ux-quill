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

class MockContainerBlot {
    static blotName = 'mock-container';
    static tagName = 'div';
    static className: string;
    static defaultChild: string;
    children: any[] = [];
    domNode: HTMLElement;
    next: any = null;
    parent: any = null;

    constructor(domNode: Node) {
        this.domNode = domNode as HTMLElement;
    }

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

    insertBefore(child: any, ref?: any) {}
    appendChild(child: any) {
        this.children.push(child);
    }
    length(): number {
        return 1;
    }
    remove() {}
}

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
class MockBlockBlot {
    static blotName = 'mock-block';
    static tagName = 'p';
    static className: string;
    static allowedChildren: any[];

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
    if (name === 'blots/container') {
        return MockContainerBlot;
    }
    if (name === 'blots/block') {
        return MockBlockBlot;
    }
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
