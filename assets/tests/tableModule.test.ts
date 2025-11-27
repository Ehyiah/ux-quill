
import { TableModule } from '../src/modules/tableModule';
import { TableUI } from '../src/modules/tableUI';

// Mock dependencies
jest.mock('../src/modules/tableUI');
jest.mock('../src/blots/tableBlots', () => ({
    TableContainerBlot: { blotName: 'table' },
    TableBodyBlot: { blotName: 'table-body' },
    TableRowBlot: { blotName: 'table-row' },
    TableCellBlot: { blotName: 'table-cell' }
}));

describe('TableModule', () => {
    let quillMock: any;
    let module: TableModule;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock Quill instance
        quillMock = {
            getModule: jest.fn(),
            keyboard: {
                addBinding: jest.fn()
            },
            getLeaf: jest.fn(() => [null, 0]),
            getLine: jest.fn(() => [null, 0]),
            getIndex: jest.fn(() => 0),
            setSelection: jest.fn(),
            scroll: {
                descendant: jest.fn(),
                children: {
                    forEach: jest.fn()
                }
            }
        };

        // Default setup
        module = new TableModule(quillMock, {});
    });

    test('should initialize with default options', () => {
        expect(module.options.defaultRows).toBe(3);
        expect(module.options.defaultCols).toBe(3);
        expect(module.options.showUI).toBe(true);
    });

    test('should initialize UI if showUI is true', () => {
        expect(TableUI).toHaveBeenCalledWith(quillMock, module, { showContextMenu: true });
        expect(module.tableUI).toBeInstanceOf(TableUI);
    });

    test('should not initialize UI if showUI is false', () => {
        (TableUI as jest.Mock).mockClear();
        module = new TableModule(quillMock, { showUI: false });
        expect(TableUI).not.toHaveBeenCalled();
        expect(module.tableUI).toBeNull();
    });

    test('should register keyboard bindings', () => {
        expect(quillMock.keyboard.addBinding).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'Tab' })
        );
    });

    describe('insertTable', () => {
        test('should call insertTable with correct dimensions', () => {
            // Mock internal methods to avoid complex DOM mocking
            const createTableSpy = jest.spyOn(module as any, 'createTable').mockImplementation(() => { });

            // Mock selection
            quillMock.getSelection = jest.fn(() => ({ index: 0 }));
            quillMock.getLeaf = jest.fn(() => [{ parent: { statics: { blotName: 'block' } } }, 0]);

            module.insertTable(2, 4);

            expect(createTableSpy).toHaveBeenCalledWith(2, 4);
        });
    });

    describe('deleteTable', () => {
        test('should remove table if found', () => {
            const tableMock = { remove: jest.fn() };
            jest.spyOn(module as any, 'getTable').mockReturnValue(tableMock);

            module.deleteTable();

            expect(tableMock.remove).toHaveBeenCalled();
        });
    });
});
