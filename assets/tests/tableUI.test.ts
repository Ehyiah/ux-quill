
import { TableUI } from '../src/modules/tableUI';
import { TableModule } from '../src/modules/tableModule';

// Mock dependencies
jest.mock('../src/modules/tableModule');

describe('TableUI', () => {
    let quillMock: any;
    let tableModuleMock: any;
    let ui: TableUI;

    beforeEach(() => {
        // Mock Quill
        quillMock = {
            root: document.createElement('div'),
            container: document.createElement('div'),
            on: jest.fn()
        };
        document.body.appendChild(quillMock.container);

        // Mock TableModule
        tableModuleMock = new TableModule(quillMock);
        tableModuleMock.insertRowAbove = jest.fn();
        tableModuleMock.insertRowBelow = jest.fn();
        tableModuleMock.insertColumnLeft = jest.fn();
        tableModuleMock.insertColumnRight = jest.fn();
        tableModuleMock.deleteRow = jest.fn();
        tableModuleMock.deleteColumn = jest.fn();
        tableModuleMock.deleteTable = jest.fn();

        ui = new TableUI(quillMock, tableModuleMock, { showContextMenu: true });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should create context menu on initialization', () => {
        const menu = document.querySelector('.ql-table-context-menu');
        expect(menu).toBeTruthy();
        expect(menu?.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    test('should add event listener for contextmenu', () => {
        expect(quillMock.root.oncontextmenu).toBeDefined();
    });

    test('handleAction should call appropriate module method', () => {
        // Simulate action calls directly since we can't easily trigger click events on private methods
        (ui as any).handleAction('insertRowAbove');
        expect(tableModuleMock.insertRowAbove).toHaveBeenCalled();

        (ui as any).handleAction('deleteTable');
        expect(tableModuleMock.deleteTable).toHaveBeenCalled();
    });

    test('destroy should remove menu and listeners', () => {
        ui.destroy();
        const menu = document.querySelector('.ql-table-context-menu');
        expect(menu).toBeNull();
        expect(quillMock.root.oncontextmenu).toBeNull();
    });
});
