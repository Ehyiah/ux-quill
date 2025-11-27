import Quill from 'quill';
const Block = Quill.import('blots/block');
const Container = Quill.import('blots/container');

/**
 * TableCellBlock - A block that lives inside table cells
 * Prevents merging between different cells
 */
class TableCellBlock extends Block {
  static blotName = 'table-cell-block';
  static tagName = 'P';
  checkMerge() {
    // Only merge with sibling blocks in the same cell
    if (!this.next || this.next.statics.blotName !== 'table-cell-block') {
      return false;
    }

    // Check if both blocks are in the same cell
    const thisCell = this.parent;
    const nextCell = this.next.parent;
    return thisCell === nextCell;
  }
}

/**
 * TableCellBlot - Represents a table cell (<td>)
 * Extends Container to allow block content within cells
 */
class TableCellBlot extends Container {
  static blotName = 'table-cell';
  static tagName = 'TD';
  static className = 'ql-table-cell';
  static create(value) {
    const node = super.create(value);
    if (value && typeof value === 'object') {
      if (value.row !== undefined) {
        node.setAttribute('data-row', value.row);
      }
      if (value.col !== undefined) {
        node.setAttribute('data-col', value.col);
      }
      if (value.colspan && value.colspan > 1) {
        node.setAttribute('colspan', value.colspan);
      }
      if (value.rowspan && value.rowspan > 1) {
        node.setAttribute('rowspan', value.rowspan);
      }
    }
    return node;
  }
  static formats(domNode) {
    const formats = {};
    if (domNode.hasAttribute('data-row')) {
      formats.row = domNode.getAttribute('data-row');
    }
    if (domNode.hasAttribute('data-col')) {
      formats.col = domNode.getAttribute('data-col');
    }
    if (domNode.hasAttribute('colspan')) {
      formats.colspan = parseInt(domNode.getAttribute('colspan') || '1', 10);
    }
    if (domNode.hasAttribute('rowspan')) {
      formats.rowspan = parseInt(domNode.getAttribute('rowspan') || '1', 10);
    }
    return formats;
  }
  format(name, value) {
    if (name === 'table-cell') {
      if (value && typeof value === 'object') {
        const node = this.domNode;
        if (value.row !== undefined) {
          node.setAttribute('data-row', value.row);
        }
        if (value.col !== undefined) {
          node.setAttribute('data-col', value.col);
        }
        if (value.colspan && value.colspan > 1) {
          node.setAttribute('colspan', value.colspan);
        } else {
          node.removeAttribute('colspan');
        }
        if (value.rowspan && value.rowspan > 1) {
          node.setAttribute('rowspan', value.rowspan);
        } else {
          node.removeAttribute('rowspan');
        }
      }
    } else {
      super.format(name, value);
    }
  }
  optimize(context) {
    // Call parent optimize but carefully control the behavior
    // to prevent cells from being moved or removed unexpectedly
    const parent = this.parent;

    // Only optimize if we're in a stable state (within a proper row)
    if (parent && parent.statics.blotName === 'table-row') {
      super.optimize(context);

      // Ensure cell has at least one child block
      if (this.children.length === 0) {
        const block = this.scroll.create('table-cell-block');
        this.appendChild(block);
      }
    }
  }
  checkMerge() {
    // Never merge table cells - each cell must remain separate
    // even if they have the same row, different col values make them distinct
    return false;
  }
  deleteAt(index, length) {
    super.deleteAt(index, length);

    // Ensure cell always has at least one block after deletion
    if (this.children.length === 0) {
      const block = this.scroll.create('table-cell-block');
      this.appendChild(block);
    }
  }
}

/**
 * TableRowBlot - Represents a table row (<tr>)
 * Container that holds only TableCellBlot children
 */
class TableRowBlot extends Container {
  static blotName = 'table-row';
  static tagName = 'TR';
  static className = 'ql-table-row';
  static create(value) {
    const node = super.create(value);
    if (value && typeof value === 'object' && value.row !== undefined) {
      node.setAttribute('data-row', value.row);
    }
    return node;
  }
  static formats(domNode) {
    const formats = {};
    if (domNode.hasAttribute('data-row')) {
      formats.row = domNode.getAttribute('data-row');
    }
    return formats;
  }
  optimize(context) {
    super.optimize(context);

    // Ensure row is within a tbody
    const parent = this.parent;
    if (parent && parent.statics.blotName !== 'table-body') {
      this.wrap('table-body', {});
    }

    // Don't automatically remove empty rows - this can cause cells to disappear during editing
    // Only remove if explicitly needed (e.g., during deleteRow operation)
  }
  checkMerge() {
    return false; // Prevent rows from merging with different row indices
  }
}

/**
 * TableBodyBlot - Represents table body (<tbody>)
 * Container that holds only TableRowBlot children
 */
class TableBodyBlot extends Container {
  static blotName = 'table-body';
  static tagName = 'TBODY';
  static className = 'ql-table-body';
  optimize(context) {
    super.optimize(context);

    // Ensure tbody is within a table
    const parent = this.parent;
    if (parent && parent.statics.blotName !== 'table') {
      this.wrap('table', {});
    }

    // Don't automatically remove empty tbody - this can cause structural issues during editing
  }
  checkMerge() {
    return false;
  }
}

/**
 * TableContainerBlot - Represents the table container (<table>)
 * Top-level container for the entire table structure
 */
class TableContainerBlot extends Container {
  static blotName = 'table';
  static tagName = 'TABLE';
  static className = 'ql-table';
  static scope = (() => Quill.import('parchment').Scope.BLOCK_BLOT)();
  optimize(context) {
    super.optimize(context);

    // Don't automatically remove empty tables - this can cause issues during editing
    // Tables should only be removed explicitly by user actions
  }
  checkMerge() {
    return false;
  }
}

// Define allowed children for each container
TableContainerBlot.allowedChildren = [TableBodyBlot];
TableBodyBlot.allowedChildren = [TableRowBlot];
TableRowBlot.allowedChildren = [TableCellBlot];
// Only allow TableCellBlock children in cells
// This prevents unwanted nesting and merging issues between cells
TableCellBlot.allowedChildren = [TableCellBlock];
TableCellBlot.requiredContainer = TableRowBlot;
export { TableContainerBlot, TableBodyBlot, TableRowBlot, TableCellBlot, TableCellBlock };