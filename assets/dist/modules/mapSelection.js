function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import Quill from 'quill';
const ICONS = {
  alignLeft: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"></rect><line x1="15" y1="4" x2="21" y2="4"></line><line x1="15" y1="8" x2="21" y2="8"></line><line x1="15" y1="12" x2="21" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignLeftBlock: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="10" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignCenter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  alignRight: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="3" width="8" height="8" rx="1"></rect><line x1="3" y1="4" x2="9" y2="4"></line><line x1="3" y1="8" x2="9" y2="8"></line><line x1="3" y1="12" x2="9" y2="12"></line><line x1="3" y1="16" x2="21" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>',
  edit: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
  paraBefore: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 3H21"></path></svg>',
  paraAfter: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19M5 12H19"></path><path d="M11 21H21"></path></svg>',
  sizeCustom: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11v6"></path><path d="M11 11v6"></path><path d="M15 11v6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path><path d="M21 7H3"></path></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  cancel: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>'
};
export default class MapSelection {
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = void 0;
    this.options = void 0;
    this.selectedMap = null;
    this.overlay = null;
    this.toolbar = null;
    this.inputBar = null;
    this.repositionHandler = void 0;
    this.handleDocumentMouseDown = e => {
      const target = e.target;
      if (!this.quill.container.contains(target)) {
        this.deselectMap();
      }
    };
    this.quill = quill;
    this.options = _extends({
      borderColor: '#007bff',
      borderWidth: '2px',
      deleteTitle: 'Delete map',
      editLocationTitle: 'Edit location',
      buttonBeforeLabel: ICONS.paraBefore,
      buttonAfterLabel: ICONS.paraAfter,
      buttonBeforeTitle: 'Insert a paragraph before',
      buttonAfterTitle: 'Insert a paragraph after',
      alignLabels: {
        left: 'Left (wrapped)',
        leftBlock: 'Left (no wrap)',
        center: 'Center',
        right: 'Right (wrapped)'
      },
      sectionLabels: {
        align: 'Align',
        map: 'Map',
        size: 'Size',
        insert: 'Insert'
      }
    }, options);
    this.repositionHandler = this.reposition.bind(this);
    this.quill.root.addEventListener('click', this.handleClick.bind(this), true);
    this.quill.root.addEventListener('scroll', this.repositionHandler, true);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    window.addEventListener('resize', this.repositionHandler);
    this.injectStyles();
  }
  injectStyles() {
    const styleId = 'ql-map-selection-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = "\n.ql-editor .ql-map {\n    cursor: pointer;\n}\n.ql-map-overlay {\n    position: absolute;\n    border: " + this.options.borderWidth + " solid " + this.options.borderColor + ";\n    box-sizing: border-box;\n    pointer-events: none;\n    z-index: 1000;\n    user-select: none;\n    -webkit-user-select: none;\n}\n.ql-map-toolbar {\n    position: absolute;\n    background: #333;\n    border-radius: 4px;\n    padding: 4px;\n    display: flex;\n    gap: 4px;\n    z-index: 1002;\n    pointer-events: auto;\n    user-select: none;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n    align-items: flex-end;\n}\n.ql-map-toolbar-section {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n}\n.ql-map-toolbar-section-label {\n    font-size: 12px;\n    color: #aaa;\n    text-transform: uppercase;\n    font-weight: bold;\n    pointer-events: none;\n    user-select: none;\n}\n.ql-map-toolbar-section-buttons {\n    display: flex;\n    gap: 4px;\n    align-items: center;\n}\n.ql-map-toolbar button {\n    background: transparent;\n    border: none;\n    color: #ddd;\n    padding: 6px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 3px;\n    transition: background 0.2s, color 0.2s;\n    min-width: 28px;\n    font-weight: bold;\n    font-size: 11px;\n}\n.ql-map-toolbar button:hover {\n    background: #444;\n    color: white;\n}\n.ql-map-toolbar button.active {\n    background: " + this.options.borderColor + " !important;\n    color: white !important;\n}\n.ql-map-toolbar .ql-toolbar-separator {\n    width: 1px;\n    background: #444;\n    margin: 4px 2px;\n    height: 16px;\n}\n.ql-map-input-bar {\n    position: absolute;\n    background: #333;\n    border-radius: 4px;\n    padding: 6px;\n    display: flex;\n    gap: 4px;\n    align-items: center;\n    z-index: 1003;\n    pointer-events: auto;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n}\n.ql-map-input-bar input {\n    border: 1px solid #555;\n    background: #222;\n    color: #fff;\n    border-radius: 3px;\n    padding: 4px 6px;\n    font-size: 12px;\n}\n.ql-map-input-bar button {\n    background: transparent;\n    border: none;\n    color: #ddd;\n    padding: 4px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 3px;\n}\n.ql-map-input-bar button:hover {\n    background: #444;\n    color: white;\n}\n";
    document.head.appendChild(style);
  }
  handleClick(e) {
    const target = e.target;
    if (this.toolbar && this.toolbar.contains(target)) return;
    if (this.overlay && this.overlay.contains(target)) return;
    const map = this.findMapAtPoint(e.clientX, e.clientY);
    if (map) {
      e.preventDefault();
      this.selectMap(map);
      return;
    }
    this.deselectMap();
  }
  findMapAtPoint(x, y) {
    const maps = this.quill.root.querySelectorAll('.ql-map');
    for (const map of Array.from(maps)) {
      if (!this.quill.root.contains(map)) continue;
      const rect = map.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return map;
      }
    }
    return null;
  }
  selectMap(map) {
    if (this.selectedMap === map) return;
    this.deselectMap();
    this.selectedMap = map;
    this.selectedMap.classList.add('ql-map-selected');
    this.showOverlay();
  }
  deselectMap() {
    if (this.selectedMap) {
      this.selectedMap.classList.remove('ql-map-selected');
      this.selectedMap = null;
    }
    this.hideOverlay();
  }
  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
    if (this.inputBar) {
      this.inputBar.remove();
      this.inputBar = null;
    }
  }
  showOverlay() {
    if (!this.selectedMap) return;
    this.overlay = document.createElement('div');
    this.overlay.className = 'ql-map-overlay';
    this.quill.container.appendChild(this.overlay);
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'ql-map-toolbar';
    this.quill.container.appendChild(this.toolbar);
    this.setupToolbar();
    this.updateActiveButtons();
    this.reposition();
  }
  setupToolbar() {
    if (!this.toolbar) return;
    this.addSection(this.options.sectionLabels.insert, container => {
      const btnBefore = document.createElement('button');
      btnBefore.type = 'button';
      btnBefore.dataset.action = 'paragraph-before';
      btnBefore.innerHTML = this.options.buttonBeforeLabel;
      btnBefore.title = this.options.buttonBeforeTitle;
      btnBefore.addEventListener('click', e => {
        e.stopPropagation();
        this.insertParagraphBefore();
      });
      container.appendChild(btnBefore);
    });
    this.addSeparator();
    this.addSection(this.options.sectionLabels.size, container => {
      const sizes = ['25%', '50%', '75%', '100%'];
      sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = size;
        btn.title = "Set width to " + size;
        btn.dataset.size = size;
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this.setSize(size);
        });
        container.appendChild(btn);
      });
      const btnCustomSize = document.createElement('button');
      btnCustomSize.type = 'button';
      btnCustomSize.innerHTML = ICONS.sizeCustom;
      btnCustomSize.title = 'Set custom width';
      btnCustomSize.addEventListener('click', e => {
        e.stopPropagation();
        this.showSizeInput();
      });
      container.appendChild(btnCustomSize);
    });
    this.addSeparator();
    this.addSection(this.options.sectionLabels.align, container => {
      const aligns = [{
        name: 'left',
        icon: ICONS.alignLeft
      }, {
        name: 'leftBlock',
        icon: ICONS.alignLeftBlock
      }, {
        name: 'center',
        icon: ICONS.alignCenter
      }, {
        name: 'right',
        icon: ICONS.alignRight
      }];
      aligns.forEach(align => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = align.icon;
        btn.title = this.options.alignLabels[align.name];
        btn.dataset.align = align.name;
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this.alignMap(align.name);
        });
        container.appendChild(btn);
      });
    });
    this.addSeparator();
    this.addSection(this.options.sectionLabels.map, container => {
      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.dataset.action = 'edit-location';
      btnEdit.innerHTML = ICONS.edit;
      btnEdit.title = this.options.editLocationTitle;
      btnEdit.addEventListener('click', e => {
        e.stopPropagation();
        this.editLocation();
      });
      container.appendChild(btnEdit);
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.dataset.action = 'delete';
      btnDelete.innerHTML = ICONS.trash;
      btnDelete.title = this.options.deleteTitle;
      btnDelete.style.color = '#ff4d4d';
      btnDelete.addEventListener('click', e => {
        e.stopPropagation();
        this.deleteMap();
      });
      container.appendChild(btnDelete);
    });
    this.addSeparator();
    this.addSection(this.options.sectionLabels.insert, container => {
      const btnAfter = document.createElement('button');
      btnAfter.type = 'button';
      btnAfter.dataset.action = 'paragraph-after';
      btnAfter.innerHTML = this.options.buttonAfterLabel;
      btnAfter.title = this.options.buttonAfterTitle;
      btnAfter.addEventListener('click', e => {
        e.stopPropagation();
        this.insertParagraphAfter();
      });
      container.appendChild(btnAfter);
    });
  }
  addSection(label, callback) {
    if (!this.toolbar) return;
    const section = document.createElement('div');
    section.className = 'ql-map-toolbar-section';
    if (label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'ql-map-toolbar-section-label';
      labelEl.textContent = label;
      section.appendChild(labelEl);
    }
    const buttons = document.createElement('div');
    buttons.className = 'ql-map-toolbar-section-buttons';
    callback(buttons);
    section.appendChild(buttons);
    this.toolbar.appendChild(section);
  }
  addSeparator() {
    if (!this.toolbar) return;
    const sep = document.createElement('div');
    sep.className = 'ql-toolbar-separator';
    this.toolbar.appendChild(sep);
  }
  getBlot() {
    if (!this.selectedMap) return null;
    return Quill.find(this.selectedMap);
  }
  alignMap(align) {
    const blot = this.getBlot();
    if (!blot) return;
    blot.format('align', align);
    this.quill.update('api');
    this.updateActiveButtons();
    setTimeout(() => this.reposition(), 100);
  }
  setSize(size) {
    if (!this.selectedMap || !size) return;
    let finalSize = size.trim();
    if (/^\d+$/.test(finalSize)) {
      finalSize += 'px';
    }
    const blot = this.getBlot();
    if (!blot) return;
    blot.format('width', finalSize);
    this.quill.update('api');
    this.updateActiveSizeButtons();
    setTimeout(() => this.reposition(), 100);
  }
  showSizeInput() {
    if (!this.selectedMap) return;
    const currentWidth = this.selectedMap.style.width || '100%';
    this.showGenericInput(currentWidth.endsWith('px') ? currentWidth.replace('px', '') : currentWidth, 'e.g. 300 or 50%', '80px', val => this.setSize(val));
  }
  showGenericInput(currentValue, placeholder, width, onSave) {
    if (!this.selectedMap) return;
    if (this.toolbar) this.toolbar.style.display = 'none';
    this.inputBar = document.createElement('div');
    this.inputBar.className = 'ql-map-input-bar';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.placeholder = placeholder;
    input.style.width = width;
    this.inputBar.appendChild(input);
    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.innerHTML = ICONS.check;
    btnOk.addEventListener('click', e => {
      e.stopPropagation();
      onSave(input.value);
      this.hideInputBar();
    });
    this.inputBar.appendChild(btnOk);
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.innerHTML = ICONS.cancel;
    btnCancel.addEventListener('click', e => {
      e.stopPropagation();
      this.hideInputBar();
    });
    this.inputBar.appendChild(btnCancel);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        onSave(input.value);
        this.hideInputBar();
      } else if (e.key === 'Escape') {
        this.hideInputBar();
      }
    });
    this.quill.container.appendChild(this.inputBar);
    this.reposition();
    input.focus();
    input.select();
  }
  hideInputBar() {
    if (this.inputBar) {
      this.inputBar.remove();
      this.inputBar = null;
    }
    if (this.toolbar) {
      this.toolbar.style.display = 'flex';
      this.reposition();
    }
  }
  editLocation() {
    if (!this.selectedMap) return;
    const mapModule = this.quill.getModule('map');
    if (mapModule && typeof mapModule.editMapLocation === 'function') {
      mapModule.editMapLocation(this.selectedMap);
    }
  }
  deleteMap() {
    if (!this.selectedMap) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.deselectMap();
      this.quill.deleteText(index, 1, 'user');
    }
  }
  insertParagraphBefore() {
    if (!this.selectedMap) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index, 0, 'user');
      this.deselectMap();
    }
  }
  insertParagraphAfter() {
    if (!this.selectedMap) return;
    const blot = this.getBlot();
    if (blot) {
      const index = this.quill.getIndex(blot) + 1;
      this.quill.insertText(index, '\n', 'user');
      this.quill.setSelection(index + 1, 0, 'user');
      this.deselectMap();
    }
  }
  isCurrentAlign(name) {
    if (!this.selectedMap) return false;
    const style = this.selectedMap.style;
    switch (name) {
      case 'left':
        return (style.float === '' || style.float === 'none') && style.marginLeft !== 'auto';
      case 'leftBlock':
        return style.float === 'left';
      case 'center':
        return (style.float === '' || style.float === 'none') && style.marginLeft === 'auto';
      case 'right':
        return style.float === 'right';
      default:
        return false;
    }
  }
  updateActiveButtons() {
    if (!this.selectedMap || !this.toolbar) return;
    this.toolbar.querySelectorAll('button[data-align]').forEach(btn => {
      const name = btn.dataset.align;
      if (name && this.isCurrentAlign(name)) btn.classList.add('active');else btn.classList.remove('active');
    });
    this.updateActiveSizeButtons();
  }
  updateActiveSizeButtons() {
    if (!this.selectedMap || !this.toolbar) return;
    const currentWidth = this.selectedMap.style.width;
    this.toolbar.querySelectorAll('button[data-size]').forEach(btn => {
      const size = btn.dataset.size;
      if (size && currentWidth === size) btn.classList.add('active');else btn.classList.remove('active');
    });
  }
  reposition() {
    if (!this.selectedMap || !this.overlay) return;
    const rect = this.selectedMap.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    const top = rect.top - containerRect.top;
    const left = rect.left - containerRect.left;
    this.overlay.style.top = top + "px";
    this.overlay.style.left = left + "px";
    this.overlay.style.width = rect.width + "px";
    this.overlay.style.height = rect.height + "px";
    const activeBar = this.inputBar && this.inputBar.parentNode ? this.inputBar : this.toolbar;
    if (!activeBar) return;
    const barWidth = activeBar.offsetWidth || 300;
    let barLeft = left + rect.width / 2 - barWidth / 2;
    if (barLeft < 5) barLeft = 5;
    const maxLeft = containerRect.width - barWidth - 5;
    if (barLeft > maxLeft) barLeft = maxLeft;
    activeBar.style.left = barLeft + "px";
    const barHeight = activeBar.offsetHeight || 40;
    let barTop = top - barHeight - 10;
    if (barTop < 0) barTop = 5;
    activeBar.style.top = barTop + "px";
  }
}