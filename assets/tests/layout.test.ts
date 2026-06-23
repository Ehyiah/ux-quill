import LayoutBlot from '../src/blots/layout';

describe('LayoutBlot', () => {
    describe('create', () => {
        it('should create a grid container with correct columns', () => {
            const value = {
                cols: 2,
                ratios: ['1fr', '1fr'],
                columns: ['<p>Left</p>', '<p>Right</p>'],
            };

            const node = LayoutBlot.create(value);

            expect(node.classList.contains('ql-layout')).toBe(true);
            expect(node.contentEditable).toBe('false');
            expect(node.style.display).toBe('grid');
            expect(node.style.gridTemplateColumns).toBe('1fr 1fr');
            expect(node.dataset.cols).toBe('2');
            expect(node.dataset.ratios).toBe('1fr|1fr');
        });

        it('should create the right number of column children', () => {
            const value = {
                cols: 3,
                ratios: ['1fr', '1fr', '1fr'],
                columns: ['<p>A</p>', '<p>B</p>', '<p>C</p>'],
            };

            const node = LayoutBlot.create(value);
            const cols = node.querySelectorAll('.ql-layout-col');

            expect(cols.length).toBe(3);
        });

        it('should set contenteditable on each column', () => {
            const value = {
                cols: 2,
                ratios: ['1fr', '1fr'],
                columns: ['<p>X</p>', '<p>Y</p>'],
            };

            const node = LayoutBlot.create(value);
            const cols = node.querySelectorAll('.ql-layout-col');

            cols.forEach((col) => {
                expect((col as HTMLElement).contentEditable).toBe('true');
            });
        });

        it('should fill empty columns with a default paragraph', () => {
            const value = {
                cols: 2,
                ratios: ['1fr', '1fr'],
                columns: ['<p>Only left</p>', ''],
            };

            const node = LayoutBlot.create(value);
            const cols = node.querySelectorAll('.ql-layout-col');

            expect(cols[0].innerHTML).toBe('<p>Only left</p>');
            expect(cols[1].innerHTML).toBe('<p><br></p>');
        });

        it('should set data-col-index on each column', () => {
            const value = {
                cols: 3,
                ratios: ['1fr', '1fr', '1fr'],
                columns: ['<p>a</p>', '<p>b</p>', '<p>c</p>'],
            };

            const node = LayoutBlot.create(value);
            const cols = node.querySelectorAll('.ql-layout-col');

            expect(cols[0].getAttribute('data-col-index')).toBe('0');
            expect(cols[1].getAttribute('data-col-index')).toBe('1');
            expect(cols[2].getAttribute('data-col-index')).toBe('2');
        });
    });

    describe('value', () => {
        it('should extract columns, cols and ratios from DOM node', () => {
            const container = document.createElement('div');
            container.className = 'ql-layout';
            container.dataset.cols = '2';
            container.dataset.ratios = '1fr|2fr';
            container.style.gridTemplateColumns = '1fr 2fr';

            const col1 = document.createElement('div');
            col1.className = 'ql-layout-col';
            col1.innerHTML = '<p>Left</p>';
            container.appendChild(col1);

            const col2 = document.createElement('div');
            col2.className = 'ql-layout-col';
            col2.innerHTML = '<p>Right</p>';
            container.appendChild(col2);

            const result = LayoutBlot.value(container);

            expect(result.cols).toBe(2);
            expect(result.ratios).toEqual(['1fr', '2fr']);
            expect(result.columns).toEqual(['<p>Left</p>', '<p>Right</p>']);
        });

        it('should handle single column layout', () => {
            const container = document.createElement('div');
            container.className = 'ql-layout';
            container.dataset.cols = '1';
            container.dataset.ratios = '1fr';

            const col = document.createElement('div');
            col.className = 'ql-layout-col';
            col.innerHTML = '<p>Alone</p>';
            container.appendChild(col);

            const result = LayoutBlot.value(container);

            expect(result.cols).toBe(1);
            expect(result.columns).toEqual(['<p>Alone</p>']);
        });
    });
});
