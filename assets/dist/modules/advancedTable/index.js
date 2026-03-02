import Quill from 'quill';
const Module = Quill.import('core/module');
const Icons = Quill.import('ui/icons');

// Global Icon
Icons['advanced-table'] = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`;
const CSS = `
.ql-editor table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 30px 0; border: 1px solid #bbb; }
.ql-editor td, .ql-editor th { border: 1px solid #bbb !important; padding: 10px !important; min-width: 40px; height: 35px; word-break: break-all; position: relative; }
.ql-editor th { background-color: #f1f3f5 !important; font-weight: bold !important; text-align: center !important; }

.ql-table-ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; }
.ql-table-control-btn {
    position: absolute; width: 22px; height: 22px; background-color: #007bff; border-radius: 50%;
    display: none; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto;
    color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 102; transform: translate(-50%, -50%);
    transition: transform 0.1s, background-color 0.2s; border: 2px solid #fff;
}
.ql-table-control-btn:hover { background-color: #0056b3; transform: translate(-50%, -50%) scale(1.2); }
.ql-table-control-btn svg { width: 12px; height: 12px; pointer-events: none; stroke-width: 4px; }

.ql-table-grid-container {
    position: fixed; background: white; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    border-radius: 8px; padding: 12px; z-index: 10001; display: none; flex-direction: column; gap: 8px; font-family: sans-serif;
}
.ql-table-grid-info { font-size: 13px; color: #333; text-align: center; font-weight: bold; }
.ql-table-grid { display: grid; grid-template-columns: repeat(10, 20px); gap: 4px; }
.ql-table-grid-cell { width: 20px; height: 20px; border: 1px solid #ddd; border-radius: 2px; cursor: pointer; }
.ql-table-grid-cell.active { background-color: rgba(0, 123, 255, 0.4); border-color: #007bff; }

.ql-table-context-menu {
    position: fixed; background: white; border: 1px solid #ccc; box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    border-radius: 8px; padding: 6px 0; z-index: 10000; display: none; min-width: 220px; font-family: sans-serif;
}
.ql-table-context-menu-item { padding: 10px 16px; cursor: pointer; font-size: 13px; color: #333; display: flex; align-items: center; gap: 12px; }
.ql-table-context-menu-item:hover { background-color: #f0f7ff; color: #007bff; }
.ql-table-context-menu-separator { height: 1px; background-color: #eee; margin: 6px 0; }
`;
const ICONS_INNER = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  header: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 18V6M20 18V6"></path></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
};
class AdvancedTable extends Module {
  static moduleName = 'advanced-table';
  isBusy = false;
  gridContainer;
  gridInfo;
  gridCells = [];
  constructor(quill, options) {
    super(quill, options);
    this.quill = quill;
    this.overlay = null;
    this.colBtn = null;
    this.rowBtn = null;
    this.hoveredCell = null;
    this.hideTimeout = null;
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
    this.rowBtn = this.createButton('ql-table-add-row', "Ajouter une ligne au-dessus", () => this.executeAction('insertRowAbove'));
    this.colBtn = this.createButton('ql-table-add-col', "Ajouter une colonne à droite", () => this.executeAction('insertColumnRight'));
    this.overlay.appendChild(this.colBtn);
    this.overlay.appendChild(this.rowBtn);
    this.quill.root.addEventListener('mousemove', e => this.handleMouseMove(e));
    this.quill.root.addEventListener('mouseleave', () => this.startHideTimeout());
    this.initContextMenu();
    this.initGridSelector();
    setTimeout(() => {
      const toolbar = this.quill.getModule('toolbar');
      if (toolbar) {
        const button = toolbar.container.querySelector('.ql-advanced-table');
        if (button) button.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
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
        cell.addEventListener('mouseenter', () => {
          this.gridInfo.textContent = `${r} x ${c}`;
          this.gridCells.forEach((gc, idx) => {
            const gr = Math.floor(idx / 10) + 1;
            const gcol = idx % 10 + 1;
            gc.classList.toggle('active', gr <= r && gcol <= c);
          });
        });
        cell.addEventListener('click', () => {
          this.executeAction('insertTable', [r, c]);
          this.gridContainer.style.display = 'none';
        });
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
  createButton(className, title, onClick) {
    const btn = document.createElement('div');
    btn.classList.add('ql-table-control-btn', className);
    btn.innerHTML = ICONS_INNER.plus;
    btn.title = title;
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.isBusy) return;
      this.isBusy = true;
      onClick();
      setTimeout(() => {
        this.isBusy = false;
      }, 500);
    });
    btn.addEventListener('mouseenter', () => this.clearHideTimeout());
    btn.addEventListener('mouseleave', () => this.startHideTimeout());
    return btn;
  }
  executeAction(method, args) {
    if (args === void 0) {
      args = [];
    }
    this.quill.focus();
    const tableModule = this.quill.getModule('table') || this.quill.getModule('table-better');
    if (!tableModule) return;
    if (this.hoveredCell && method !== 'insertTable') {
      const blot = Quill.find(this.hoveredCell);
      if (blot) this.quill.setSelection(blot.offset(this.quill.scroll), 0, 'silent');
    }
    if (method === 'toggleHeaderRow') {
      this.toggleHeaderRow();
    } else if (typeof tableModule[method] === 'function') {
      tableModule[method](...args);
    } else if (tableModule) {
      if (method === 'insertRowAbove' && tableModule.insertRowAbove) tableModule.insertRowAbove();else if (method === 'insertColumnRight' && tableModule.insertColumnRight) tableModule.insertColumnRight();else if (method === 'deleteRow' && tableModule.deleteRow) tableModule.deleteRow();else if (method === 'deleteColumn' && tableModule.deleteColumn) tableModule.deleteColumn();else if (method === 'deleteTable' && tableModule.deleteTable) tableModule.deleteTable();
    }
  }
  toggleHeaderRow() {
    if (!this.hoveredCell || this.isBusy) return;
    this.isBusy = true;
    const row = this.hoveredCell.closest('tr');
    if (!row) {
      this.isBusy = false;
      return;
    }
    const isToHeader = row.children[0]?.tagName !== 'TH';
    Array.from(row.children).forEach(cell => {
      this.setSemanticCell(cell, isToHeader);
    });
    this.quill.update();
    setTimeout(() => {
      this.isBusy = false;
    }, 300);
  }
  setSemanticCell(cell, toHeader) {
    const blot = Quill.find(cell);
    if (!blot) return;
    const rowBlot = blot.parent;
    if (!rowBlot) return;

    // Auto-detect correct target blot name from allowed children of the row
    const allowed = rowBlot.constructor.allowedChildren || [];
    const targetBlot = allowed.find(c => toHeader ? c.tagName === 'TH' || c.blotName.includes('header') || c.blotName.includes('-th') : c.tagName === 'TD' || c.blotName.includes('cell') || c.blotName.includes('-td'));
    const targetName = targetBlot ? targetBlot.blotName : toHeader ? 'table-header' : 'table-cell';
    try {
      // Apply visual styles inline for safety and persistence
      if (toHeader) {
        cell.style.backgroundColor = '#f1f3f5';
        cell.style.fontWeight = 'bold';
        cell.style.textAlign = 'center';
      } else {
        cell.style.backgroundColor = '';
        cell.style.fontWeight = '';
        cell.style.textAlign = '';
      }

      // Semantic switch using Quill registry
      const currentName = blot.constructor.blotName;
      const formats = blot.formats();
      const value = formats[currentName] || {};
      blot.replaceWith(targetName, value);
    } catch (e) {
      // Fallback manual DOM change (very safe against crashes)
      const newNode = document.createElement(toHeader ? 'TH' : 'TD');
      if (toHeader) {
        newNode.style.backgroundColor = '#f1f3f5';
        newNode.style.fontWeight = 'bold';
      }
      while (cell.firstChild) newNode.appendChild(cell.firstChild);
      cell.parentNode?.replaceChild(newNode, cell);
    }
  }
  handleMouseMove(e) {
    const cell = e.target.closest('td, th');
    if (cell) {
      this.clearHideTimeout();
      this.hoveredCell = cell;
      this.updateUIPosition(cell);
      this.showButtons();
    } else if (!e.target.closest('.ql-table-control-btn')) {
      this.startHideTimeout();
    }
  }
  startHideTimeout() {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => this.hideButtons(), 800);
  }
  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  showButtons() {
    if (this.colBtn) this.colBtn.style.display = 'flex';
    if (this.rowBtn) this.rowBtn.style.display = 'flex';
  }
  hideButtons() {
    if (this.colBtn) this.colBtn.style.display = 'none';
    if (this.rowBtn) this.rowBtn.style.display = 'none';
  }
  updateUIPosition(cell) {
    const cellRect = cell.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const cellTop = cellRect.top - containerRect.top;
    const cellLeft = cellRect.left - containerRect.left;
    const cellRight = cellRect.right - containerRect.left;

    // TOP adds ROW Above
    this.rowBtn.style.top = `${cellTop}px`;
    this.rowBtn.style.left = `${cellLeft + cellRect.width / 2}px`;

    // RIGHT adds COLUMN Right
    this.colBtn.style.top = `${cellTop + cellRect.height / 2}px`;
    this.colBtn.style.left = `${cellRight}px`;
  }
  initContextMenu() {
    this.contextMenu = document.createElement('div');
    this.contextMenu.classList.add('ql-table-context-menu');
    document.body.appendChild(this.contextMenu);
    document.addEventListener('mousedown', e => {
      if (!this.gridContainer.contains(e.target) && !this.contextMenu.contains(e.target)) {
        this.contextMenu.style.display = 'none';
      }
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
    const actions = [{
      text: 'Basculer en Header',
      icon: ICONS_INNER.header,
      action: () => this.executeAction('toggleHeaderRow')
    }, {
      separator: true
    }, {
      text: 'Insérer ligne au-dessus',
      action: () => this.executeAction('insertRowAbove')
    }, {
      text: 'Insérer ligne en-dessous',
      action: () => this.executeAction('insertRowBelow') || this.quill.getModule('table').insertRowBelow()
    }, {
      text: 'Insérer colonne à gauche',
      action: () => this.executeAction('insertColumnLeft') || this.quill.getModule('table').insertColumnLeft()
    }, {
      text: 'Insérer colonne à droite',
      action: () => this.executeAction('insertColumnRight')
    }, {
      separator: true
    }, {
      text: 'Fusionner cellules',
      action: () => this.executeAction('mergeCells')
    }, {
      text: 'Scinder cellule',
      action: () => this.executeAction('splitCell')
    }, {
      separator: true
    }, {
      text: 'Supprimer le tableau',
      action: () => this.quill.getModule('table').deleteTable()
    }];
    actions.forEach(item => {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.classList.add('ql-table-context-menu-separator');
        this.contextMenu.appendChild(sep);
      } else {
        const menuItem = document.createElement('div');
        menuItem.classList.add('ql-table-context-menu-item');
        menuItem.innerHTML = `<span class="ql-table-icon" style="width:16px;height:16px;display:flex;opacity:0.7;">${item.icon || ''}</span> <span>${item.text}</span>`;
        menuItem.addEventListener('click', () => {
          item.action();
          this.contextMenu.style.display = 'none';
        });
        this.contextMenu.appendChild(menuItem);
      }
    });
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.display = 'block';
  }
}
export default AdvancedTable;