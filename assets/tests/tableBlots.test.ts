
import { TableContainerBlot, TableBodyBlot, TableRowBlot, TableCellBlot, TableCellBlock } from '../src/blots/tableBlots';

// Mock Quill and Parchment
jest.mock('quill', () => {
    return {
        import: jest.fn((name) => {
            if (name === 'blots/block') {
                return class Block {
                    static blotName = 'block';
                    static tagName = 'P';
                    domNode: HTMLElement;
                    parent: any;
                    next: any;
                    static create(value: any) {
                        return document.createElement(this.tagName);
                    }
                    constructor(node: HTMLElement) {
                        this.domNode = node;
                    }
                    appendChild(child: any) { child.parent = this; }
                    checkMerge() { return false; }
                };
            }
            if (name === 'blots/container') {
                return class Container {
                    static blotName = 'container';
                    static tagName = 'DIV';
                    domNode: HTMLElement;
                    parent: any;
                    children: any[] = [];
                    static create(value: any) {
                        return document.createElement(this.tagName);
                    }
                    constructor(node: HTMLElement) {
                        this.domNode = node;
                    }
                    appendChild(child: any) { 
                        this.children.push(child);
                        child.parent = this; 
                    }
                    format(name: string, value: any) {}
                    optimize(context: any) {}
                    deleteAt(index: number, length: number) {}
                    wrap(name: string, value: any) {}
                };
            }
            if (name === 'parchment') {
                return {
                    Scope: { BLOCK_BLOT: 1 }
                };
            }
            return {};
        })
    };
});

describe('Table Blots', () => {
    describe('TableCellBlot', () => {
        test('should have correct static properties', () => {
            expect(TableCellBlot.blotName).toBe('table-cell');
            expect(TableCellBlot.tagName).toBe('TD');
            expect(TableCellBlot.className).toBe('ql-table-cell');
        });

        test('create should return a TD element with attributes', () => {
            const value = { row: '1', col: '2', colspan: 2, rowspan: 3 };
            const node = TableCellBlot.create(value);
            
            expect(node.tagName).toBe('TD');
            expect(node.getAttribute('data-row')).toBe('1');
            expect(node.getAttribute('data-col')).toBe('2');
            expect(node.getAttribute('colspan')).toBe('2');
            expect(node.getAttribute('rowspan')).toBe('3');
        });

        test('formats should extract attributes from DOM', () => {
            const td = document.createElement('td');
            td.setAttribute('data-row', '5');
            td.setAttribute('data-col', '3');
            td.setAttribute('colspan', '2');
            
            const formats = TableCellBlot.formats(td);
            expect(formats).toEqual({
                row: '5',
                col: '3',
                colspan: 2
            });
        });
    });

    describe('TableRowBlot', () => {
        test('should have correct static properties', () => {
            expect(TableRowBlot.blotName).toBe('table-row');
            expect(TableRowBlot.tagName).toBe('TR');
            expect(TableRowBlot.className).toBe('ql-table-row');
        });

        test('create should return a TR element with data-row', () => {
            const value = { row: '10' };
            const node = TableRowBlot.create(value);
            
            expect(node.tagName).toBe('TR');
            expect(node.getAttribute('data-row')).toBe('10');
        });
    });

    describe('TableBodyBlot', () => {
        test('should have correct static properties', () => {
            expect(TableBodyBlot.blotName).toBe('table-body');
            expect(TableBodyBlot.tagName).toBe('TBODY');
            expect(TableBodyBlot.className).toBe('ql-table-body');
        });
    });

    describe('TableContainerBlot', () => {
        test('should have correct static properties', () => {
            expect(TableContainerBlot.blotName).toBe('table');
            expect(TableContainerBlot.tagName).toBe('TABLE');
            expect(TableContainerBlot.className).toBe('ql-table');
        });
    });

    describe('TableCellBlock', () => {
        test('should have correct static properties', () => {
            expect(TableCellBlock.blotName).toBe('table-cell-block');
            expect(TableCellBlock.tagName).toBe('P');
        });

        test('checkMerge should return false for different cells', () => {
            const block1 = new TableCellBlock(document.createElement('p'));
            const block2 = new TableCellBlock(document.createElement('p'));
            
            // Mock parents (cells)
            const cell1 = { domNode: document.createElement('td') };
            const cell2 = { domNode: document.createElement('td') };
            
            block1.parent = cell1;
            block2.parent = cell2;
            
            // Mock next sibling relationship
            block1.next = block2;
            // Mock statics for next block
            block2.statics = { blotName: 'table-cell-block' };

            expect(block1.checkMerge()).toBe(false);
        });
    });
});
