jest.mock('quill', () => {
    const mockBlockEmbed = class MockBlockEmbed {
        static blotName = 'mock-block';
        static tagName = 'div';
        static className = 'mock-block';
        domNode: HTMLElement;
        constructor(domNode: HTMLElement) {
            this.domNode = domNode;
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
        static formats(node: HTMLElement): any {
            return {};
        }
        format(name: string, value: any): void {}
    };

    const MockQuill = jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        getModule: jest.fn().mockImplementation((name: string) => {
            if (name === 'toolbar') {
                return {
                    container: document.createElement('div'),
                    addHandler: jest.fn(),
                    handlers: {},
                };
            }
            return null;
        }),
        getSelection: jest.fn().mockReturnValue({ index: 0, length: 0 }),
        insertEmbed: jest.fn(),
        setSelection: jest.fn(),
        root: document.createElement('div'),
        clipboard: { convert: jest.fn().mockReturnValue({ ops: [] }) },
        container: document.createElement('div'),
    }));

    (MockQuill as any).register = jest.fn();
    (MockQuill as any).import = jest.fn().mockImplementation((name: string) => {
        if (name === 'blots/block/embed') return mockBlockEmbed;
        if (name === 'ui/icons') return {};
        return null;
    });

    return { __esModule: true, default: MockQuill };
});

import Quill from 'quill';
import CalloutBlot from '../src/blots/callout';
import { Callout } from '../src/modules/callout';

describe('CalloutBlot', () => {
    test('static properties', () => {
        expect(CalloutBlot.blotName).toBe('callout');
        expect(CalloutBlot.tagName).toBe('div');
        expect(CalloutBlot.className).toBe('ql-callout');
    });

    test('create() builds the DOM structure', () => {
        const node = CalloutBlot.create({ type: 'warning' });
        expect(node).toBeInstanceOf(HTMLElement);
        expect(node.classList.contains('ql-callout')).toBe(true);
        expect(node.classList.contains('ql-callout--warning')).toBe(true);
        expect(node.dataset.calloutType).toBe('warning');

        const header = node.querySelector('.ql-callout-header');
        expect(header).toBeTruthy();
        expect(header!.contentEditable).toBe('false');

        const content = node.querySelector('.ql-callout-content');
        expect(content).toBeTruthy();
        expect(content!.contentEditable).toBe('true');
    });

    test('create() defaults to info type', () => {
        const node = CalloutBlot.create({});
        expect(node.classList.contains('ql-callout--info')).toBe(true);
        expect(node.dataset.calloutType).toBe('info');
    });

    test('value() extracts type and content from the DOM', () => {
        const node = document.createElement('div');
        node.classList.add('ql-callout--success');
        node.dataset.calloutType = 'success';
        const header = document.createElement('div');
        header.className = 'ql-callout-header';
        node.appendChild(header);
        const content = document.createElement('div');
        content.className = 'ql-callout-content';
        content.innerHTML = '<p>Hello</p>';
        node.appendChild(content);

        const val = CalloutBlot.value(node);
        expect(val.type).toBe('success');
        expect(val.content).toBe('<p>Hello</p>');
    });
});

describe('Callout module', () => {
    let mockToolbar: any;
    let mockQuill: any;

    beforeEach(() => {
        (Quill as any).mockClear();
        mockToolbar = {
            container: document.createElement('div'),
            addHandler: jest.fn(),
            handlers: {},
        };
        mockQuill = new (Quill as any)();
        mockQuill.getModule.mockImplementation((name: string) => {
            if (name === 'toolbar') return mockToolbar;
            return null;
        });
    });

    test('constructor registers toolbar handler', () => {
        const module = new Callout(mockQuill, {});
        expect(mockToolbar.addHandler).toHaveBeenCalledWith('callout', expect.any(Function));
    });

    test('togglePicker shows and hides the picker', () => {
        const btn = document.createElement('button');
        btn.className = 'ql-callout';
        mockToolbar.container.appendChild(btn);
        document.body.appendChild(mockToolbar.container);

        const module = new Callout(mockQuill, {
            types: ['info', 'warning'],
            labels: { info: 'Info', warning: 'Warning' },
        });

        module.togglePicker();
        expect(module['picker']).toBeTruthy();
        expect(document.querySelector('.ql-callout-picker')).toBeTruthy();

        module.togglePicker();
        expect(module['picker']).toBeNull();
        expect(document.querySelector('.ql-callout-picker')).toBeNull();

        document.body.removeChild(mockToolbar.container);
    });

    test('insert() calls quill.insertEmbed', () => {
        const module = new Callout(mockQuill, { defaultType: 'danger' });
        module.insert();
        expect(mockQuill.insertEmbed).toHaveBeenCalledWith(0, 'callout', { type: 'danger' }, 'user');
    });
});
