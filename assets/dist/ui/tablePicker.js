/**
 * TablePicker - Dimension picker for inserting tables
 * Shows a grid to select table dimensions (like Excel)
 */
export class TablePicker {
  quill;
  tableModule;
  picker = null;
  grid = null;
  label = null;
  maxRows = 10;
  maxCols = 10;
  currentRows = 0;
  currentCols = 0;
  constructor(quill, tableModule) {
    this.quill = quill;
    this.tableModule = tableModule;
  }

  /**
   * Create the picker element
   */
  createPicker() {
    this.picker = document.createElement('div');
    this.picker.className = 'ql-table-picker';

    // Create grid
    this.grid = document.createElement('div');
    this.grid.className = 'ql-table-picker-grid';
    this.grid.style.gridTemplateColumns = `repeat(${this.maxCols}, 1fr)`;
    this.grid.style.gridTemplateRows = `repeat(${this.maxRows}, 1fr)`;

    // Create cells
    for (let row = 0; row < this.maxRows; row++) {
      for (let col = 0; col < this.maxCols; col++) {
        const cell = document.createElement('div');
        cell.className = 'ql-table-picker-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();

        // Hover effect
        cell.addEventListener('mouseenter', () => {
          this.highlightCells(row, col);
        });

        // Click to insert
        cell.addEventListener('click', () => {
          this.insertTable(row + 1, col + 1);
          this.hidePicker();
        });
        this.grid.appendChild(cell);
      }
    }

    // Create label
    this.label = document.createElement('div');
    this.label.className = 'ql-table-picker-label';
    this.label.textContent = 'Sélectionner la taille';
    this.picker.appendChild(this.grid);
    this.picker.appendChild(this.label);

    // Reset on mouse leave
    this.picker.addEventListener('mouseleave', () => {
      this.highlightCells(-1, -1);
    });
    return this.picker;
  }

  /**
   * Highlight cells up to row and col
   */
  highlightCells(row, col) {
    if (!this.grid) return;
    const cells = this.grid.querySelectorAll('.ql-table-picker-cell');
    cells.forEach(cell => {
      const cellRow = parseInt(cell.dataset.row || '0', 10);
      const cellCol = parseInt(cell.dataset.col || '0', 10);
      if (cellRow <= row && cellCol <= col) {
        cell.classList.add('hover');
      } else {
        cell.classList.remove('hover');
      }
    });

    // Update label
    if (this.label) {
      if (row >= 0 && col >= 0) {
        this.label.textContent = `${row + 1} × ${col + 1}`;
        this.currentRows = row + 1;
        this.currentCols = col + 1;
      } else {
        this.label.textContent = 'Sélectionner la taille';
        this.currentRows = 0;
        this.currentCols = 0;
      }
    }
  }

  /**
   * Insert table with selected dimensions
   */
  insertTable(rows, cols) {
    this.tableModule.insertTable(rows, cols);
  }

  /**
   * Show the picker
   */
  showPicker(button) {
    if (!this.picker) {
      this.createPicker();
    }
    if (!this.picker) return;
    this.picker.classList.add('active');

    // Position below the button
    const rect = button.getBoundingClientRect();
    this.picker.style.left = `${rect.left}px`;
    this.picker.style.top = `${rect.bottom + 5}px`;

    // Adjust if off screen
    const pickerRect = this.picker.getBoundingClientRect();
    if (pickerRect.right > window.innerWidth) {
      this.picker.style.left = `${window.innerWidth - pickerRect.width - 10}px`;
    }
    if (pickerRect.bottom > window.innerHeight) {
      this.picker.style.top = `${rect.top - pickerRect.height - 5}px`;
    }

    // Add to document if not already
    if (!this.picker.parentNode) {
      document.body.appendChild(this.picker);
    }
  }

  /**
   * Hide the picker
   */
  hidePicker() {
    if (this.picker) {
      this.picker.classList.remove('active');
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.picker && this.picker.parentNode) {
      this.picker.parentNode.removeChild(this.picker);
    }
  }
}