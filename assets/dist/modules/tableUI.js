import { TablePicker } from "../ui/tablePicker.js";
/**
 * TableUI - User interface for table operations
 * Provides context menu and toolbar integration
 */
export class TableUI {
  quill;
  tableModule;
  options;
  contextMenu = null;
  currentCell = null;
  tablePicker = null;
  constructor(quill, tableModule, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.tableModule = tableModule;
    this.options = {
      showContextMenu: options.showContextMenu !== false
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
  createContextMenu() {
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
    this.contextMenu.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const action = button.getAttribute('data-action');
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
  attachEventListeners() {
    // Listen for clicks on table cells
    this.quill.root.addEventListener('contextmenu', e => {
      const target = e.target;
      const cell = target.closest('.ql-table-cell');
      if (cell) {
        e.preventDefault();
        e.stopPropagation();
        this.showContextMenu(e.clientX, e.clientY, cell);
      }
    });

    // Hide menu on click outside
    document.addEventListener('click', e => {
      if (this.contextMenu && !this.contextMenu.contains(e.target)) {
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
  showContextMenu(x, y, cell) {
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
  hideContextMenu() {
    if (!this.contextMenu) return;
    this.contextMenu.classList.remove('active');
    this.currentCell = null;
  }

  /**
   * Handle menu action
   */
  handleAction(action) {
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
  attachToolbarListener() {
    // Wait for toolbar to be ready
    setTimeout(() => {
      const toolbar = this.quill.getModule('toolbar');
      if (!toolbar) return;

      // Override the table handler to show picker instead of inserting directly
      toolbar.addHandler('table', value => {
        // Find the table button in the toolbar
        const container = this.quill.container;
        const tableButton = container.parentElement?.querySelector('.ql-table');
        if (tableButton && this.tablePicker) {
          this.tablePicker.showPicker(tableButton);
        }
      });

      // Find the table button in the toolbar
      const container = this.quill.container;
      const tableButton = container.parentElement?.querySelector('.ql-table');
      if (tableButton) {
        // Hide picker on click outside
        document.addEventListener('click', e => {
          if (this.tablePicker && !tableButton.contains(e.target) && this.tablePicker.picker && !this.tablePicker.picker.contains(e.target)) {
            this.tablePicker.hidePicker();
          }
        });
      }
    }, 100);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.contextMenu && this.contextMenu.parentNode) {
      this.contextMenu.parentNode.removeChild(this.contextMenu);
    }
    if (this.tablePicker) {
      this.tablePicker.destroy();
    }
  }
}