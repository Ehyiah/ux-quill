import Quill from 'quill';
const Module = Quill.import('core/module');
const Icons = Quill.import('ui/icons');
const Parchment = Quill.import('parchment');

/**
 * Register Style Attributors
 */
const TableBackground = new Parchment.StyleAttributor('table-bg', 'background-color', {
  scope: Parchment.Scope.BLOCK
});
const TableFontWeight = new Parchment.StyleAttributor('table-weight', 'font-weight', {
  scope: Parchment.Scope.BLOCK
});
const TableTextAlign = new Parchment.StyleAttributor('table-align', 'text-align', {
  scope: Parchment.Scope.BLOCK
});
const TableWidth = new Parchment.StyleAttributor('table-width', 'width', {
  scope: Parchment.Scope.BLOCK
});
const TableHeight = new Parchment.StyleAttributor('table-height', 'height', {
  scope: Parchment.Scope.BLOCK
});
Quill.register(TableBackground, true);
Quill.register(TableFontWeight, true);
Quill.register(TableTextAlign, true);
Quill.register(TableWidth, true);
Quill.register(TableHeight, true);

/**
 * Register semantic table header blots
 */
const registerTableBlots = quillInstance => {
  try {
    const registry = quillInstance?.scroll?.registry || Quill.registry;
    if (!registry) return;
    const TableCell = registry.query('table');
    const TableRow = registry.query('table-row');
    if (TableCell && !registry.query('table-th')) {
      class TableHeader extends TableCell {
        static blotName = 'table-th';
        static tagName = 'TH';
        static formats(domNode) {
          return domNode.getAttribute('data-row');
        }
        formats() {
          const rowId = this.constructor.formats(this.domNode);
          return {
            ...super.formats(),
            'table': rowId,
            'table-th': true
          };
        }
        format(name, value) {
          if (name === 'table-th') return;
          if (name === 'table') {
            if (value) this.domNode.setAttribute('data-row', value);
          } else {
            super.format(name, value);
          }
        }
      }
      TableHeader.requiredContainer = TableRow;
      if (TableRow && TableRow.allowedChildren && !TableRow.allowedChildren.includes(TableHeader)) {
        TableRow.allowedChildren.push(TableHeader);
      }
      Quill.register(TableHeader, true);
    }
  } catch (e) {
    console.warn('AdvancedTable: Failed to register blots', e);
  }
};
registerTableBlots();

// Global Icon
Icons['advanced-table'] = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`;
const CSS = `
.ql-editor table { border-collapse: collapse; width: 100%; margin: 30px 0; border: 1px solid #bbb; table-layout: fixed; }
.ql-editor td, .ql-editor th { border: 1px solid #bbb !important; padding: 10px !important; min-width: 40px; height: 35px; word-break: break-all; position: relative; box-sizing: border-box; }
.ql-editor th { background-color: #f1f3f5; font-weight: bold; text-align: center; }
.ql-table-ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; }
.ql-table-resizer { position: absolute; z-index: 1000; pointer-events: auto; }
.ql-table-resizer.col { cursor: col-resize; width: 12px; }
.ql-table-resizer.row { cursor: row-resize; height: 12px; }
.ql-table-resizer:hover { background-color: rgba(0, 123, 255, 0.4); }
.ql-table-grid-container { position: fixed; background: white; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; padding: 12px; z-index: 10001; display: none; flex-direction: column; gap: 8px; font-family: sans-serif; }
.ql-table-grid-info { font-size: 13px; color: #333; text-align: center; font-weight: bold; }
.ql-table-grid { display: grid; grid-template-columns: repeat(10, 20px); gap: 4px; }
.ql-table-grid-cell { width: 20px; height: 20px; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; }
.ql-table-grid-cell.active { background-color: rgba(0, 123, 255, 0.4); border-color: #007bff; }
.ql-table-context-menu { position: fixed; background: white; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; padding: 6px 0; z-index: 10000; display: none; min-width: 220px; font-family: sans-serif; }
.ql-table-context-menu-item { padding: 10px 16px; cursor: pointer; font-size: 13px; color: #333; display: flex; align-items: center; gap: 12px; }
.ql-table-context-menu-item:hover { background-color: #f0f7ff; color: #007bff; }
.ql-table-context-menu-separator { height: 1px; background-color: #eee; margin: 6px 0; }
`;
const ICONS_INNER = {
  header: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 18V6M20 18V6"></path></svg>'
};
class AdvancedTable extends Module {
  static moduleName = 'advanced-table';
  gridContainer;
  gridInfo;
  gridCells = [];
  overlay = null;
  hoveredCell = null;
  contextMenu = null;
  dragging = null;
  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    registerTableBlots(this.quill);
    this.injectStyles();
    this.init();
  }
  injectStyles() {
    if (document.getElementById('ql-advanced-table-styles')) return;
    const style = document.createElement('style');
    style.id = 'ql-advanced-table-styles';
    style.innerHTML = CSS;
    document.head.appendChild(style);
  }
  init() {
    this.overlay = document.createElement('div');
    this.overlay.classList.add('ql-table-ui');
    this.quill.container.appendChild(this.overlay);
    this.quill.root.addEventListener('mousemove', e => this.handleMouseMove(e));
    document.addEventListener('mousemove', e => this.handleDragging(e));
    document.addEventListener('mouseup', () => this.stopDragging());
    this.initContextMenu();
    this.initGridSelector();
    setTimeout(() => {
      const toolbar = this.quill.getModule('toolbar');
      if (toolbar) {
        const button = toolbar.container.querySelector('.ql-advanced-table');
        if (button) button.addEventListener('click', e => {
          e.preventDefault();
          this.showGridSelector(button);
        });
      }
    }, 500);
  }
  initGridSelector() {
    this.gridContainer = document.createElement('div');
    this.gridContainer.classList.add('ql-table-grid-container');
    this.gridInfo = document.createElement('div');
    this.gridInfo.classList.add('ql-table-grid-info');
    this.gridInfo.textContent = 'Sélectionner la taille';
    this.gridContainer.appendChild(this.gridInfo);
    const grid = document.createElement('div');
    grid.classList.add('ql-table-grid');
    for (let r = 1; r <= 10; r++) {
      for (let c = 1; c <= 10; c++) {
        const cell = document.createElement('div');
        cell.classList.add('ql-table-grid-cell');
        cell.onmouseenter = () => {
          this.gridInfo.textContent = `${r} x ${c}`;
          this.gridCells.forEach((gc, idx) => gc.classList.toggle('active', Math.floor(idx / 10) < r && idx % 10 < c));
        };
        cell.onclick = () => {
          this.executeAction('insertTable', [r, c]);
          this.gridContainer.style.display = 'none';
        };
        grid.appendChild(cell);
        this.gridCells.push(cell);
      }
    }
    this.gridContainer.appendChild(grid);
    document.body.appendChild(this.gridContainer);
    document.addEventListener('mousedown', e => {
      if (!this.gridContainer.contains(e.target)) this.gridContainer.style.display = 'none';
    });
  }
  showGridSelector(button) {
    const rect = button.getBoundingClientRect();
    this.gridContainer.style.top = `${rect.bottom + 5}px`;
    this.gridContainer.style.left = `${rect.left}px`;
    this.gridContainer.style.display = 'flex';
  }
  executeAction(method, args) {
    if (args === void 0) {
      args = [];
    }
    this.quill.focus();
    const tableModule = this.quill.getModule('table') || this.quill.getModule('table-better');
    if (!tableModule) return;
    if (this.hoveredCell && method !== 'insertTable') {
      let refCell = this.hoveredCell;
      if (refCell.tagName === 'TH') {
        const substitute = this.findSubstituteCell(refCell, method);
        if (substitute) refCell = substitute;
      }
      const blot = Quill.find(refCell);
      if (blot) {
        const index = blot.offset(this.quill.scroll);
        this.quill.setSelection(index, 0, 'silent');
      }
    }
    if (method === 'toggleHeaderRow') this.toggleHeaderRow();else if (method === 'toggleHeaderColumn') this.toggleHeaderColumn();else if (typeof tableModule[method] === 'function') {
      const headerState = method.startsWith('insert') ? this.captureHeaderState() : null;
      tableModule[method](...args);
      if (method.startsWith('insert')) {
        setTimeout(() => this.fixHeadersAfterAction(headerState), 100);
      }
    }
    this.quill.update();
  }
  findSubstituteCell(th, method) {
    const table = th.closest('table');
    if (!table) return null;
    const row = th.closest('tr');
    const colIdx = th.cellIndex;
    const rowIdx = Array.from(table.rows).indexOf(row);
    const isRowOp = method.includes('Row');
    if (isRowOp) {
      // Pour une opération sur les lignes : besoin d'être dans la bonne ligne.
      // Chercher un TD dans la même ligne (cas header colonne).
      const tdInRow = Array.from(row.cells).find(c => c.tagName === 'TD');
      if (tdInRow) return tdInRow;
      // Toute la ligne est TH (header row) : utiliser la ligne adjacente.
      const adjRowIdx = method.includes('Below') ? rowIdx + 1 : rowIdx - 1;
      const adjRow = table.rows[adjRowIdx];
      if (adjRow) {
        const tdAdj = Array.from(adjRow.cells).find(c => c.tagName === 'TD');
        if (tdAdj) return tdAdj;
      }
    } else {
      // Pour une opération sur les colonnes : besoin d'être dans la bonne colonne.
      // Chercher un TD dans la même colonne (cas header ligne).
      for (let r = 0; r < table.rows.length; r++) {
        if (r === rowIdx) continue;
        const cell = table.rows[r].cells[colIdx];
        if (cell?.tagName === 'TD') return cell;
      }
    }

    // Dernier recours : n'importe quel TD du tableau.
    return table.querySelector('td');
  }
  captureHeaderState() {
    const table = this.quill.root.querySelector('table');
    if (!table) return null;
    const rows = Array.from(table.rows);
    if (!rows.length) return null;
    return {
      hasHeaderRow: Array.from(rows[0].cells).every(c => c.tagName === 'TH'),
      hasHeaderCol: rows.every(r => r.cells[0]?.tagName === 'TH')
    };
  }
  fixHeadersAfterAction(state) {
    const table = this.quill.root.querySelector('table');
    if (!table) return;
    const rows = Array.from(table.rows);
    if (!rows.length) return;
    const isRowHeader = state?.hasHeaderRow ?? Array.from(rows[0].cells).every(c => c.tagName === 'TH');
    const isColHeader = state?.hasHeaderCol ?? rows.every(r => r.cells[0]?.tagName === 'TH');
    if (!isRowHeader && !isColHeader) return;
    rows.forEach((row, rIdx) => {
      Array.from(row.cells).forEach((cell, cIdx) => {
        const shouldBeHeader = isRowHeader && rIdx === 0 || isColHeader && cIdx === 0;
        if (shouldBeHeader) this.setSemanticCell(cell, true);
      });
    });
    this.reconnectAndSync();
  }
  toggleHeaderRow() {
    if (!this.hoveredCell) return;
    const row = this.hoveredCell.closest('tr');
    if (!row) return;
    const toHeader = row.querySelector('td') !== null;
    Array.from(row.children).forEach(cell => this.setSemanticCell(cell, toHeader));
    this.reconnectAndSync();
  }
  toggleHeaderColumn() {
    if (!this.hoveredCell) return;
    const table = this.hoveredCell.closest('table');
    if (!table) return;
    const colIdx = this.hoveredCell.cellIndex;
    const toHeader = this.hoveredCell.tagName !== 'TH';
    Array.from(table.rows).forEach(row => {
      if (row.cells[colIdx]) this.setSemanticCell(row.cells[colIdx], toHeader);
    });
    this.reconnectAndSync();
  }
  reconnectAndSync() {
    this.quill.scroll.build();
    this.quill.scroll.optimize();
    this.quill.update('user');
    if (this.quill.emitter) this.quill.emitter.emit('text-change', null, null, 'user');
  }
  setSemanticCell(cell, toHeader) {
    if (toHeader && cell.tagName === 'TH' || !toHeader && cell.tagName === 'TD') return;
    const blot = Quill.find(cell);
    if (!blot) return;
    const rowId = cell.getAttribute('data-row');
    if (!rowId) return;

    // Use Quill's internal replaceWith to maintain the tree structure
    blot.replaceWith(toHeader ? 'table-th' : 'table', rowId);
  }
  handleMouseMove(e) {
    if (this.dragging) return;
    const cell = e.target.closest('td, th');
    if (cell) {
      this.hoveredCell = cell;
      this.updateResizers(cell, e);
    } else {
      this.clearResizers();
    }
  }
  updateResizers(cell, e) {
    if (!this.overlay) return;
    const rect = cell.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const threshold = 12;
    const isRight = Math.abs(e.clientX - rect.right) < threshold;
    const isBottom = Math.abs(e.clientY - rect.bottom) < threshold;
    if (isRight || isBottom) {
      this.clearResizers();
      if (isRight) this.createResizer('col', cell, {
        top: rect.top - containerRect.top,
        left: rect.right - containerRect.left - 6,
        height: rect.height
      });
      if (isBottom) this.createResizer('row', cell, {
        top: rect.bottom - containerRect.top - 6,
        left: rect.left - containerRect.left,
        width: rect.width
      });
    }
  }
  createResizer(type, cell, style) {
    const resizer = document.createElement('div');
    resizer.classList.add('ql-table-resizer', type);
    Object.assign(resizer.style, {
      top: `${style.top}px`,
      left: `${style.left}px`,
      width: style.width ? `${style.width}px` : '12px',
      height: style.height ? `${style.height}px` : '12px'
    });
    resizer.onmousedown = e => this.startDragging(e, type, cell);
    this.overlay?.appendChild(resizer);
  }
  clearResizers() {
    this.overlay?.querySelectorAll('.ql-table-resizer').forEach(r => r.remove());
  }
  startDragging(e, type, cell) {
    e.preventDefault();
    e.stopPropagation();
    const table = cell.closest('table');
    if (!table) return;
    let targetCells = [];
    if (type === 'col') {
      const idx = cell.cellIndex;
      targetCells = Array.from(table.rows).map(row => row.cells[idx]).filter(c => !!c);
    } else targetCells = Array.from(cell.parentElement.children);
    this.dragging = {
      type,
      startSize: type === 'col' ? cell.offsetWidth : cell.offsetHeight,
      startPos: type === 'col' ? e.clientX : e.clientY,
      targetCells
    };
    document.body.style.cursor = type === 'col' ? 'col-resize' : 'row-resize';
  }
  handleDragging(e) {
    if (!this.dragging) return;
    const delta = (this.dragging.type === 'col' ? e.clientX : e.clientY) - this.dragging.startPos;
    const newSize = Math.max(30, this.dragging.startSize + delta);
    this.dragging.targetCells.forEach(cell => {
      if (this.dragging.type === 'col') cell.style.width = `${newSize}px`;else cell.style.height = `${newSize}px`;
    });
  }
  stopDragging() {
    if (!this.dragging) return;
    const {
      type,
      targetCells
    } = this.dragging;
    const formatName = type === 'col' ? 'table-width' : 'table-height';
    targetCells.forEach(cell => {
      const blot = Quill.find(cell);
      if (!blot) return;
      const val = type === 'col' ? cell.style.width : cell.style.height;
      const index = blot.offset(this.quill.scroll);
      this.quill.formatLine(index, 1, formatName, val, 'user');
    });
    this.dragging = null;
    document.body.style.cursor = '';
  }
  initContextMenu() {
    this.contextMenu = document.createElement('div');
    this.contextMenu.classList.add('ql-table-context-menu');
    document.body.appendChild(this.contextMenu);
    document.addEventListener('mousedown', e => {
      if (!this.contextMenu?.contains(e.target)) this.contextMenu.style.display = 'none';
    });
    this.quill.root.addEventListener('contextmenu', e => {
      const cell = e.target.closest('td, th');
      if (!cell) return;
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY, cell);
    });
  }
  showContextMenu(x, y, cell) {
    this.hoveredCell = cell;
    this.contextMenu.innerHTML = '';
    [{
      text: 'Header Ligne',
      icon: ICONS_INNER.header,
      action: () => this.executeAction('toggleHeaderRow')
    }, {
      text: 'Header Colonne',
      icon: ICONS_INNER.header,
      action: () => this.executeAction('toggleHeaderColumn')
    }, {
      separator: true
    }, {
      text: 'Insérer ligne au-dessus',
      action: () => this.executeAction('insertRowAbove')
    }, {
      text: 'Insérer ligne en-dessous',
      action: () => this.executeAction('insertRowBelow')
    }, {
      text: 'Insérer colonne à gauche',
      action: () => this.executeAction('insertColumnLeft')
    }, {
      text: 'Insérer colonne à droite',
      action: () => this.executeAction('insertColumnRight')
    }, {
      separator: true
    }, {
      text: 'Supprimer ligne',
      action: () => this.executeAction('deleteRow')
    }, {
      text: 'Supprimer colonne',
      action: () => this.executeAction('deleteColumn')
    }, {
      separator: true
    }, {
      text: 'Supprimer le tableau',
      action: () => this.executeAction('deleteTable')
    }].forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.classList.add('ql-table-context-menu-separator');
        this.contextMenu.appendChild(sep);
      } else {
        const div = document.createElement('div');
        div.classList.add('ql-table-context-menu-item');
        div.innerHTML = `<span style="width:16px;display:flex;opacity:0.7;">${item.icon || ''}</span><span>${item.text}</span>`;
        div.onclick = () => {
          item.action();
          this.contextMenu.style.display = 'none';
        };
        this.contextMenu.appendChild(div);
      }
    });
    Object.assign(this.contextMenu.style, {
      top: `${y}px`,
      left: `${x}px`,
      display: 'block'
    });
  }
}
export default AdvancedTable;