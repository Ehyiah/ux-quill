import Quill from 'quill';
import { TableContainerBlot, TableBodyBlot, TableRowBlot, TableCellBlot } from '../blots/tableBlots.ts';
import { TableUI } from './tableUI.ts';

type TableOptions = {
    defaultRows?: number;
    defaultCols?: number;
    showUI?: boolean;
};

export class TableModule {
    quill: Quill;
    options: TableOptions;
    tableUI: TableUI | null = null;

    constructor(quill: Quill, options: TableOptions = {}) {
        this.quill = quill;
        this.options = {
            defaultRows: options.defaultRows || 3,
            defaultCols: options.defaultCols || 3,
            showUI: options.showUI !== undefined ? options.showUI : true,
        };

        // Add keyboard navigation
        this.setupKeyboardNavigation();

        // Add table button handler if toolbar exists and no UI
        if (!this.options.showUI && this.quill.getModule('toolbar')) {
            const toolbar = this.quill.getModule('toolbar');
            if (toolbar) {
                toolbar.addHandler('table', this.handleTableButton.bind(this));
            }
        }

        // Initialize UI (must be after keyboard setup)
        if (this.options.showUI) {
            this.tableUI = new TableUI(this.quill, this, { showContextMenu: true });
        }
    }

    /**
     * Handle table button click from toolbar
     */
    handleTableButton() {
        const rows = this.options.defaultRows || 3;
        const cols = this.options.defaultCols || 3;
        this.insertTable(rows, cols);
    }

    /**
     * Setup keyboard navigation for tables
     */
    private setupKeyboardNavigation(): void {
        // Handle Tab key for navigation
        this.quill.keyboard.addBinding({
            key: 'Tab',
            handler: (range) => {
                const cell = this.getCell();
                if (!cell) return true; // Not in a table, default behavior

                const table = this.getTable();
                if (!table) return true;

                const position = this.getCellPosition();
                if (!position) return true;

                const { rows, cols } = this.getTableDimensions(table);
                const cells = this.getAllCells(table);

                // Find next cell
                let nextRow = position.row;
                let nextCol = position.col + 1;

                if (nextCol >= cols) {
                    nextCol = 0;
                    nextRow++;
                }

                // If we're at the last cell, add a new row
                if (nextRow >= rows) {
                    this.insertRowBelow();
                    nextRow = rows; // New row index
                    nextCol = 0;
                }

                // Find and focus next cell
                const nextCell = cells.find((c) => {
                    const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
                    return parseInt(formats.row || '0', 10) === nextRow &&
                        parseInt(formats.col || '0', 10) === nextCol;
                });

                if (nextCell) {
                    const index = this.quill.getIndex(nextCell);
                    this.quill.setSelection(index, 0);
                }

                return false; // Prevent default Tab behavior
            },
        });

        // Handle Shift+Tab for reverse navigation
        this.quill.keyboard.addBinding({
            key: 'Tab',
            shiftKey: true,
            handler: (range) => {
                const cell = this.getCell();
                if (!cell) return true;

                const table = this.getTable();
                if (!table) return true;

                const position = this.getCellPosition();
                if (!position) return true;

                const { cols } = this.getTableDimensions(table);
                const cells = this.getAllCells(table);

                // Find previous cell
                let prevRow = position.row;
                let prevCol = position.col - 1;

                if (prevCol < 0) {
                    prevCol = cols - 1;
                    prevRow--;
                }

                if (prevRow < 0) return false; // At first cell, do nothing

                // Find and focus previous cell
                const prevCell = cells.find((c) => {
                    const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
                    return parseInt(formats.row || '0', 10) === prevRow &&
                        parseInt(formats.col || '0', 10) === prevCol;
                });

                if (prevCell) {
                    const index = this.quill.getIndex(prevCell);
                    this.quill.setSelection(index, 0);
                }

                return false; // Prevent default Shift+Tab behavior
            },
        });
    }

    /**
     * Insert a new table at the current cursor position
     */
    insertTable(rows: number, cols: number): void {
        console.log('insertTable called with rows:', rows, 'cols:', cols);
        const range = this.quill.getSelection(true);
        if (!range) {
            console.error('No range selected');
            return;
        }

        const scroll = this.quill.scroll;

        // Create table blot
        const tableBlot = scroll.create('table');
        console.log('Created table blot:', tableBlot);

        // Create tbody blot
        const tbodyBlot = scroll.create('table-body');
        console.log('Created tbody blot:', tbodyBlot);

        // Create rows and cells
        for (let row = 0; row < rows; row++) {
            const rowBlot = scroll.create('table-row', { row: row.toString() });
            console.log(`Created row ${row}:`, rowBlot);

            for (let col = 0; col < cols; col++) {
                const cellBlot = scroll.create('table-cell', {
                    row: row.toString(),
                    col: col.toString()
                });
                console.log(`Created cell [${row},${col}]:`, cellBlot);

                // Create a table-cell-block inside the cell
                const blockBlot = scroll.create('table-cell-block');
                blockBlot.appendChild(scroll.create('break'));
                console.log('Created table-cell-block with break:', blockBlot);

                cellBlot.appendChild(blockBlot);
                rowBlot.appendChild(cellBlot);
            }

            tbodyBlot.appendChild(rowBlot);
        }

        tableBlot.appendChild(tbodyBlot);
        console.log('Final table structure:', tableBlot);

        // Insert at cursor position
        const [leaf, offset] = this.quill.getLeaf(range.index);
        if (leaf && leaf.parent) {
            const parent = leaf.parent;
            const index = parent.children.indexOf(leaf);

            // Insert after current line
            parent.insertBefore(tableBlot, leaf.next || undefined);

            console.log('Table inserted into scroll');
        }

        this.quill.update('user');
        console.log('Quill updated');

        // Set cursor after table
        this.quill.setSelection(range.index + (rows * cols) + 1, 0, 'silent');
    }

    /**
     * Get the table container at the current cursor position
     */
    private getTable(): TableContainerBlot | null {
        const range = this.quill.getSelection();
        if (!range) return null;

        const [blot] = this.quill.getLeaf(range.index);
        if (!blot) return null;

        let current = blot.parent;
        while (current) {
            if (current.statics.blotName === 'table') {
                return current as TableContainerBlot;
            }
            current = current.parent;
        }

        return null;
    }

    /**
     * Get the current cell at cursor position
     */
    private getCell(): TableCellBlot | null {
        const range = this.quill.getSelection();
        if (!range) return null;

        const [blot] = this.quill.getLeaf(range.index);
        if (!blot) return null;

        let current = blot.parent;
        while (current) {
            if (current.statics.blotName === 'table-cell') {
                return current as TableCellBlot;
            }
            current = current.parent;
        }

        return null;
    }

    /**
     * Get the position (row, col) of the current cell
     */
    private getCellPosition(): { row: number; col: number } | null {
        const cell = this.getCell();
        if (!cell) return null;

        const formats = TableCellBlot.formats(cell.domNode as HTMLTableCellElement);
        const row = parseInt(formats.row || '0', 10);
        const col = parseInt(formats.col || '0', 10);

        return { row, col };
    }

    /**
     * Get all cells in the table
     */
    private getAllCells(table: TableContainerBlot): TableCellBlot[] {
        const cells: TableCellBlot[] = [];

        table.descendants(TableCellBlot).forEach((cell) => {
            cells.push(cell as TableCellBlot);
        });

        return cells;
    }

    /**
     * Get table dimensions (rows, cols)
     */
    private getTableDimensions(table: TableContainerBlot): { rows: number; cols: number } {
        const cells = this.getAllCells(table);
        let maxRow = 0;
        let maxCol = 0;

        cells.forEach((cell) => {
            const formats = TableCellBlot.formats(cell.domNode as HTMLTableCellElement);
            const row = parseInt(formats.row || '0', 10);
            const col = parseInt(formats.col || '0', 10);
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col);
        });

        return { rows: maxRow + 1, cols: maxCol + 1 };
    }

    /**
     * Insert a row above the current cell
     */
    insertRowAbove(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        // Disable history for table structure operations
        const historyModule = this.quill.history as any;
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        const { cols } = this.getTableDimensions(table);
        const targetRow = position.row;

        // Update row indices for all cells at or after the target row
        const cells = this.getAllCells(table);
        cells.forEach((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            const row = parseInt(formats.row || '0', 10);
            if (row >= targetRow) {
                c.format('table-cell', { ...formats, row: (row + 1).toString() });
                // Update parent row data-row attribute
                if (c.parent && c.parent.statics.blotName === 'table-row') {
                    (c.parent.domNode as HTMLElement).setAttribute('data-row', (row + 1).toString());
                }
            }
        });

        // Create new row
        const scroll = this.quill.scroll;
        const newRowBlot = scroll.create('table-row', { row: targetRow.toString() });

        // Create cells for the new row
        for (let col = 0; col < cols; col++) {
            const cellBlot = scroll.create('table-cell', {
                row: targetRow.toString(),
                col: col.toString()
            });

            const blockBlot = scroll.create('table-cell-block');
            blockBlot.appendChild(scroll.create('break'));
            cellBlot.appendChild(blockBlot);
            newRowBlot.appendChild(cellBlot);
        }

        // Find the row to insert before
        const tbody = table.children.head;
        if (tbody) {
            const rows = tbody.children;
            let insertBefore = null;
            rows.forEach((row: any) => {
                const rowIndex = parseInt(row.domNode.getAttribute('data-row') || '0', 10);
                if (rowIndex === targetRow + 1 && !insertBefore) {
                    insertBefore = row;
                }
            });

            if (insertBefore) {
                tbody.insertBefore(newRowBlot, insertBefore);
            } else {
                tbody.appendChild(newRowBlot);
            }
        }

        this.quill.update('silent');
        historyModule.ignoreChange = ignoreChange;
    }

    /**
     * Insert a row below the current cell
     */
    insertRowBelow(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        // Disable history for table structure operations
        const historyModule = this.quill.history as any;
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        const { cols } = this.getTableDimensions(table);
        const targetRow = position.row + 1;

        // Update row indices for all cells after the target row
        const cells = this.getAllCells(table);
        cells.forEach((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            const row = parseInt(formats.row || '0', 10);
            if (row >= targetRow) {
                c.format('table-cell', { ...formats, row: (row + 1).toString() });
                // Update parent row data-row attribute
                if (c.parent && c.parent.statics.blotName === 'table-row') {
                    (c.parent.domNode as HTMLElement).setAttribute('data-row', (row + 1).toString());
                }
            }
        });

        // Create new row
        const scroll = this.quill.scroll;
        const newRowBlot = scroll.create('table-row', { row: targetRow.toString() });

        // Create cells for the new row
        for (let col = 0; col < cols; col++) {
            const cellBlot = scroll.create('table-cell', {
                row: targetRow.toString(),
                col: col.toString()
            });

            const blockBlot = scroll.create('table-cell-block');
            blockBlot.appendChild(scroll.create('break'));
            cellBlot.appendChild(blockBlot);
            newRowBlot.appendChild(cellBlot);
        }

        // Find the row to insert after (current row)
        const tbody = table.children.head;
        if (tbody) {
            const rows = tbody.children;
            let insertAfter = null;
            rows.forEach((row: any) => {
                const rowIndex = parseInt(row.domNode.getAttribute('data-row') || '0', 10);
                if (rowIndex === position.row) {
                    insertAfter = row;
                }
            });

            if (insertAfter) {
                tbody.insertBefore(newRowBlot, insertAfter.next);
            } else {
                tbody.appendChild(newRowBlot);
            }
        }

        this.quill.update('silent');
        historyModule.ignoreChange = ignoreChange;
    }

    /**
     * Insert a column to the left of the current cell
     */
    insertColumnLeft(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        // Disable history for table structure operations
        const historyModule = this.quill.history as any;
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        const targetCol = position.col;
        const { rows } = this.getTableDimensions(table);

        // Update column indices for all cells at or after the target column
        const cells = this.getAllCells(table);
        cells.forEach((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            const col = parseInt(formats.col || '0', 10);
            if (col >= targetCol) {
                c.format('table-cell', { ...formats, col: (col + 1).toString() });
            }
        });

        // Insert new cells for each row
        const scroll = this.quill.scroll;
        const tbody = table.children.head;
        if (!tbody) return;

        tbody.children.forEach((rowBlot: any) => {
            const rowIndex = parseInt(rowBlot.domNode.getAttribute('data-row') || '0', 10);

            // Create new cell
            const cellBlot = scroll.create('table-cell', {
                row: rowIndex.toString(),
                col: targetCol.toString()
            });

            const blockBlot = scroll.create('table-cell-block');
            blockBlot.appendChild(scroll.create('break'));
            cellBlot.appendChild(blockBlot);

            // Find the cell to insert before (the cell at targetCol + 1)
            let insertBefore = null;
            rowBlot.children.forEach((c: any) => {
                const cellCol = parseInt(c.domNode.getAttribute('data-col') || '0', 10);
                if (cellCol === targetCol + 1 && !insertBefore) {
                    insertBefore = c;
                }
            });

            if (insertBefore) {
                rowBlot.insertBefore(cellBlot, insertBefore);
            } else {
                rowBlot.appendChild(cellBlot);
            }
        });

        this.quill.update('silent');
        historyModule.ignoreChange = ignoreChange;
    }

    /**
     * Insert a column to the right of the current cell
     */
    insertColumnRight(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        // Disable history for table structure operations
        const historyModule = this.quill.history as any;
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        const targetCol = position.col + 1;
        const { rows } = this.getTableDimensions(table);

        // Update column indices for all cells after the target column
        const cells = this.getAllCells(table);
        cells.forEach((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            const col = parseInt(formats.col || '0', 10);
            if (col >= targetCol) {
                c.format('table-cell', { ...formats, col: (col + 1).toString() });
            }
        });

        // Insert new cells for each row
        const scroll = this.quill.scroll;
        const tbody = table.children.head;
        if (!tbody) return;

        tbody.children.forEach((rowBlot: any) => {
            const rowIndex = parseInt(rowBlot.domNode.getAttribute('data-row') || '0', 10);

            // Create new cell
            const cellBlot = scroll.create('table-cell', {
                row: rowIndex.toString(),
                col: targetCol.toString()
            });

            const blockBlot = scroll.create('table-cell-block');
            blockBlot.appendChild(scroll.create('break'));
            cellBlot.appendChild(blockBlot);

            // Find the cell at position.col to insert after
            let insertAfter = null;
            rowBlot.children.forEach((c: any) => {
                const cellCol = parseInt(c.domNode.getAttribute('data-col') || '0', 10);
                if (cellCol === position.col) {
                    insertAfter = c;
                }
            });

            if (insertAfter) {
                rowBlot.insertBefore(cellBlot, insertAfter.next);
            } else {
                rowBlot.appendChild(cellBlot);
            }
        });

        this.quill.update('silent');
        historyModule.ignoreChange = ignoreChange;
    }

    /**
     * Delete the current row
     */
    deleteRow(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        const { rows } = this.getTableDimensions(table);
        if (rows <= 1) {
            // If only one row, delete the entire table
            this.deleteTable();
            return;
        }

        const targetRow = position.row;

        // Find the row blot to delete
        const tbody = table.children.head;
        if (!tbody) return;

        let rowToDelete = null;
        tbody.children.forEach((row: any) => {
            const rowIndex = parseInt(row.domNode.getAttribute('data-row') || '0', 10);
            if (rowIndex === targetRow) {
                rowToDelete = row;
            }
        });

        if (!rowToDelete) return;

        const cursorPosition = this.quill.getSelection()?.index || 0;

        // NOTE: Table structure operations cannot be properly undone due to Quill limitations
        // We disable history tracking for this operation to prevent corrupted undo states
        const historyModule = this.quill.history as any;

        // Temporarily disable history recording
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        // Perform the deletion at the blot level
        rowToDelete.remove();

        // Update Quill to reflect the DOM changes
        this.quill.update('silent');

        // Re-enable history recording
        historyModule.ignoreChange = ignoreChange;

        // Set cursor position
        this.quill.setSelection(Math.min(cursorPosition, this.quill.getLength() - 1), 0, 'silent');
    }

    /**
     * Delete the current column
     */
    deleteColumn(): void {
        const cell = this.getCell();
        if (!cell) return;

        const table = this.getTable();
        if (!table) return;

        const position = this.getCellPosition();
        if (!position) return;

        const { cols } = this.getTableDimensions(table);
        if (cols <= 1) {
            // If only one column, delete the entire table
            this.deleteTable();
            return;
        }

        // Disable history for table structure operations
        const historyModule = this.quill.history as any;
        const ignoreChange = historyModule.ignoreChange;
        historyModule.ignoreChange = true;

        const targetCol = position.col;
        const cells = this.getAllCells(table);

        // Delete all cells in the target column
        const cellsToDelete = cells.filter((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            return parseInt(formats.col || '0', 10) === targetCol;
        });

        cellsToDelete.forEach((c) => {
            c.remove();
        });

        // Update column indices for cells after the deleted column
        const remainingCells = this.getAllCells(table);
        remainingCells.forEach((c) => {
            const formats = TableCellBlot.formats(c.domNode as HTMLTableCellElement);
            const col = parseInt(formats.col || '0', 10);
            if (col > targetCol) {
                c.format('table-cell', { ...formats, col: (col - 1).toString() });
            }
        });

        this.quill.update('silent');
        historyModule.ignoreChange = ignoreChange;
    }

    /**
     * Delete the entire table
     */
    deleteTable(): void {
        const table = this.getTable();
        if (!table) return;

        const index = this.quill.getIndex(table);
        const length = table.length();

        this.quill.deleteText(index, length, 'user');
    }
}
