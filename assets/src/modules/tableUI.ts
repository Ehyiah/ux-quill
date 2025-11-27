import Quill from 'quill';
import { TableModule } from './tableModule.ts';
import { TablePicker } from '../ui/tablePicker.ts';

type TableUIOptions = {
    showContextMenu?: boolean;
};

/**
 * TableUI - User interface for table operations
 * Provides context menu and toolbar integration
 */
export class TableUI {
    quill: Quill;
    tableModule: TableModule;
    options: TableUIOptions;
    contextMenu: HTMLDivElement | null = null;
    currentCell: HTMLTableCellElement | null = null;
    tablePicker: TablePicker | null = null;

    constructor(quill: Quill, tableModule: TableModule, options: TableUIOptions = {}) {
        this.quill = quill;
        this.tableModule = tableModule;
        this.options = {
            showContextMenu: options.showContextMenu !== false,
        };

        // Initialize table picker
        this.tablePicker = new TablePicker(this.quill, this.tableModule);

        if (this.options.showContextMenu) {
            this.createContextMenu();
            this.attachEventListeners();
        }

        this.attachToolbarListener();
    }

    /**
     * Create the context menu element
     */
    private createContextMenu(): void {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'ql-table-context-menu';
        this.contextMenu.innerHTML = `
            <button data-action="insertRowAbove">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 8h12M8 2v12"/>
                </svg>
                Insérer ligne au-dessus
            </button>
            <button data-action="insertRowBelow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 8h12M8 2v12"/>
                </svg>
                Insérer ligne en-dessous
            </button>
            <div class="separator"></div>
            <button data-action="insertColumnLeft">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2v12M2 8h12"/>
                </svg>
                Insérer colonne à gauche
            </button>
            <button data-action="insertColumnRight">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2v12M2 8h12"/>
                </svg>
                Insérer colonne à droite
            </button>
            <div class="separator"></div>
            <button data-action="deleteRow" class="danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 8h10"/>
                </svg>
                Supprimer ligne
            </button>
            <button data-action="deleteColumn" class="danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3v10"/>
                </svg>
                Supprimer colonne
            </button>
            <div class="separator"></div>
            <button data-action="deleteTable" class="danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3 3l10 10M13 3L3 13"/>
                </svg>
                Supprimer table
            </button>
        `;

        // Add to document
        document.body.appendChild(this.contextMenu);

        // Add click handlers
        this.contextMenu.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = (button as HTMLButtonElement).getAttribute('data-action');
                if (action) {
                    this.handleAction(action);
                }
                this.hideContextMenu();
            });
        });
    }

    /**
     * Attach event listeners for showing/hiding context menu
     */
    private attachEventListeners(): void {
        // Listen for clicks on table cells
        this.quill.root.addEventListener('contextmenu', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cell = target.closest('.ql-table-cell') as HTMLTableCellElement;

            if (cell) {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e.clientX, e.clientY, cell);
            }
        });

        // Hide menu on click outside
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target as Node)) {
                this.hideContextMenu();
            }
        });

        // Hide menu on scroll
        this.quill.root.addEventListener('scroll', () => {
            this.hideContextMenu();
        });
    }

    /**
     * Show context menu at position
     */
    private showContextMenu(x: number, y: number, cell: HTMLTableCellElement): void {
        if (!this.contextMenu) return;

        this.currentCell = cell;
        this.contextMenu.classList.add('active');

        // Position the menu
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;

        // Adjust position if menu goes off screen
        const rect = this.contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenu.style.top = `${y - rect.height}px`;
        }
    }

    /**
     * Hide context menu
     */
    private hideContextMenu(): void {
        if (!this.contextMenu) return;
        this.contextMenu.classList.remove('active');
        this.currentCell = null;
    }

    /**
     * Handle menu action
     */
    private handleAction(action: string): void {
        if (!this.currentCell) return;

        // Focus on the cell to ensure proper selection
        const index = this.quill.getIndex(this.quill.scroll.find(this.currentCell));
        if (index !== -1) {
            this.quill.setSelection(index, 0);
        }

        // Execute action
        switch (action) {
            case 'insertRowAbove':
                this.tableModule.insertRowAbove();
                break;
            case 'insertRowBelow':
                this.tableModule.insertRowBelow();
                break;
            case 'insertColumnLeft':
                this.tableModule.insertColumnLeft();
                break;
            case 'insertColumnRight':
                this.tableModule.insertColumnRight();
                break;
            case 'deleteRow':
                this.tableModule.deleteRow();
                break;
            case 'deleteColumn':
                this.tableModule.deleteColumn();
                break;
            case 'deleteTable':
                this.tableModule.deleteTable();
                break;
        }
    }

    /**
     * Attach toolbar button listener
     */
    private attachToolbarListener(): void {
        // Wait for toolbar to be ready
        setTimeout(() => {
            const toolbar = this.quill.getModule('toolbar');
            if (!toolbar) return;

            // Override the table handler to show picker instead of inserting directly
            toolbar.addHandler('table', (value: any) => {
                // Find the table button in the toolbar
                const container = this.quill.container;
                const tableButton = container.parentElement?.querySelector('.ql-table');

                if (tableButton && this.tablePicker) {
                    this.tablePicker.showPicker(tableButton as HTMLElement);
                }
            });

            // Find the table button in the toolbar
            const container = this.quill.container;
            const tableButton = container.parentElement?.querySelector('.ql-table');

            if (tableButton) {
                // Hide picker on click outside
                document.addEventListener('click', (e) => {
                    if (this.tablePicker &&
                        !tableButton.contains(e.target as Node) &&
                        this.tablePicker.picker &&
                        !this.tablePicker.picker.contains(e.target as Node)) {
                        this.tablePicker.hidePicker();
                    }
                });
            }
        }, 100);
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.contextMenu && this.contextMenu.parentNode) {
            this.contextMenu.parentNode.removeChild(this.contextMenu);
        }
        if (this.tablePicker) {
            this.tablePicker.destroy();
        }
    }
}
