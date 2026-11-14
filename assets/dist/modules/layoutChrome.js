const SHOW_DELAY = 150;
const HIDE_DELAY = 320;
const VIEWPORT_MARGIN = 8;
const INTERACTIVE_MARGIN = 12;
const ICONS = {
  presets: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="14" height="12" rx="1.5"/><line x1="9" y1="3" x2="9" y2="15"/></svg>',
  caret: '<svg viewBox="0 0 10 6" width="8" height="5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>',
  add: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="9" y1="3" x2="9" y2="15"/><line x1="3" y1="9" x2="15" y2="9"/></svg>',
  remove: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="9" x2="15" y2="9"/></svg>',
  duplicate: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="9" height="9" rx="1"/><rect x="6" y="6" width="9" height="9" rx="1"/></svg>',
  unwrap: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="14" height="12" rx="1.5"/><line x1="4" y1="14" x2="14" y2="4"/></svg>'
};
export class LayoutChrome {
  constructor(quill, layout, config) {
    this.quill = void 0;
    this.layout = void 0;
    this.config = void 0;
    this.el = void 0;
    this.badge = void 0;
    this.status = void 0;
    this.confirmEl = void 0;
    this.confirmText = void 0;
    this.menuEl = null;
    this.buttons = {};
    this.currentLayout = null;
    this.pendingLayout = null;
    this.pendingRemoval = null;
    this.showTimer = null;
    this.hideTimer = null;
    this.frame = null;
    this.mounted = false;
    this.onPointerOver = event => {
      const target = event.target;
      const layoutNode = this.layout.findLayout(target);
      if (!layoutNode) return;
      if (this.currentLayout === layoutNode && !this.el.hidden) {
        this.cancelHide();
        return;
      }
      this.pendingLayout = layoutNode;
      this.cancelHide();
      this.cancelShow();
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        if (this.pendingLayout) this.show(this.pendingLayout);
      }, SHOW_DELAY);
    };
    this.onPointerOut = event => {
      var _this$menuEl;
      const related = event.relatedTarget;
      if (related && (this.el.contains(related) || this.confirmEl.contains(related) || (_this$menuEl = this.menuEl) != null && _this$menuEl.contains(related))) return;
      if (related && this.currentLayout && this.currentLayout.contains(related)) return;
      const pointer = event;
      this.maybeScheduleHide(pointer.clientX, pointer.clientY);
    };
    /**
     * Tracks the pointer while the chrome is visible so that crossing the gap
     * between the layout and the floating toolbar never hides it.
     */
    this.onPointerMove = event => {
      if (this.el.hidden) return;
      this.maybeScheduleHide(event.clientX, event.clientY);
    };
    this.onChromePointerLeave = event => {
      const related = event.relatedTarget;
      if (related && this.quill.root && this.quill.root.contains(related)) {
        const layoutNode = this.layout.findLayout(related);
        if (layoutNode === this.currentLayout) return;
      }
      const pointer = event;
      this.maybeScheduleHide(pointer.clientX, pointer.clientY);
    };
    this.keepEditorSelection = event => {
      var _event$target;
      if ((_event$target = event.target) != null && _event$target.closest('button')) {
        event.preventDefault();
      }
    };
    this.onChromeClick = event => {
      var _event$target2;
      const button = (_event$target2 = event.target) == null ? void 0 : _event$target2.closest('button[data-action]');
      if (!button || button.disabled) return;
      event.preventDefault();
      switch (button.dataset.action) {
        case 'presets':
          this.toggleMenu();
          break;
        case 'add':
          this.addColumn();
          break;
        case 'remove':
          this.requestRemoveColumn();
          break;
        case 'duplicate':
          this.duplicateLayout();
          break;
        case 'unwrap':
          this.unwrapLayout();
          break;
        default:
          break;
      }
    };
    this.onChromeKeydown = event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (!this.confirmEl.hidden) {
        this.cancelConfirm();
        return;
      }
      if (this.menuEl) {
        this.closeMenu();
        return;
      }
      this.hide();
      this.focusEditor();
    };
    this.onMenuKeydown = event => {
      const menu = this.menuEl;
      if (!menu) return;
      const items = Array.from(menu.querySelectorAll('.ql-layout-menu__item'));
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const next = current < 0 ? 0 : (current + delta + items.length) % items.length;
        items[next].focus();
        return;
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        items[event.key === 'Home' ? 0 : items.length - 1].focus();
        return;
      }
      this.onChromeKeydown(event);
    };
    this.onConfirmClick = event => {
      var _event$target3;
      const button = (_event$target3 = event.target) == null ? void 0 : _event$target3.closest('button[data-confirm]');
      if (!button) return;
      event.preventDefault();
      if (button.dataset.confirm === 'ok') {
        this.confirmRemoveColumn();
      } else {
        this.cancelConfirm();
      }
    };
    this.onDocumentPointerDown = event => {
      const target = event.target;
      if (!target) return;
      if (this.menuEl && !this.menuEl.contains(target) && !this.el.contains(target)) {
        this.closeMenu();
      }
      if (!this.confirmEl.hidden && !this.confirmEl.contains(target) && !this.el.contains(target)) {
        this.cancelConfirm();
      }
    };
    this.onDocumentKeydown = event => {
      var _this$menuEl2;
      if (event.key !== 'Escape' || this.el.hidden) return;
      const target = event.target;
      if (target && (this.el.contains(target) || (_this$menuEl2 = this.menuEl) != null && _this$menuEl2.contains(target))) return;
      this.hide();
    };
    this.onViewportChange = () => {
      if (this.el.hidden) return;
      this.schedulePosition();
    };
    this.quill = quill;
    this.layout = layout;
    this.config = config;
    this.el = document.createElement('div');
    this.el.className = 'ql-layout-chrome';
    this.el.setAttribute('role', 'toolbar');
    this.el.setAttribute('aria-label', 'Layout');
    this.el.hidden = true;
    this.badge = document.createElement('span');
    this.badge.className = 'ql-layout-chrome__badge';
    this.badge.hidden = !config.showBadge;
    this.status = document.createElement('span');
    this.status.className = 'ql-layout-visually-hidden';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');
    this.confirmEl = document.createElement('div');
    this.confirmEl.className = 'ql-layout-chrome__confirm';
    this.confirmEl.setAttribute('role', 'alertdialog');
    this.confirmEl.setAttribute('aria-label', 'Remove column');
    this.confirmEl.hidden = true;
    this.confirmText = document.createElement('p');
    this.confirmText.className = 'ql-layout-chrome__confirm-text';
    this.confirmText.textContent = 'This column contains content. Remove it anyway?';
    const confirmActions = document.createElement('div');
    confirmActions.className = 'ql-layout-chrome__confirm-actions';
    const cancelButton = this.createButton('cancel', 'Cancel', 'Cancel');
    delete cancelButton.dataset.action;
    cancelButton.dataset.confirm = 'cancel';
    const okButton = this.createButton('ok', 'Remove', 'Remove column');
    delete okButton.dataset.action;
    okButton.dataset.confirm = 'ok';
    okButton.classList.add('ql-layout-chrome__btn--danger');
    confirmActions.append(cancelButton, okButton);
    this.confirmEl.append(this.confirmText, confirmActions);
    this.el.append(this.confirmEl);
    this.buildToolbar();
  }
  mount() {
    var _ref;
    if (this.mounted) return;
    const host = (_ref = this.quill.container) != null ? _ref : this.quill.root.parentElement;
    if (!host) return;
    host.appendChild(this.el);
    this.quill.root.addEventListener('pointerover', this.onPointerOver);
    this.quill.root.addEventListener('pointerout', this.onPointerOut);
    this.el.addEventListener('pointerenter', this.cancelHide);
    this.el.addEventListener('pointerleave', this.onChromePointerLeave);
    this.el.addEventListener('mousedown', this.keepEditorSelection);
    this.el.addEventListener('click', this.onChromeClick);
    this.el.addEventListener('keydown', this.onChromeKeydown);
    this.confirmEl.addEventListener('mousedown', this.keepEditorSelection);
    this.confirmEl.addEventListener('click', this.onConfirmClick);
    this.confirmEl.addEventListener('keydown', this.onChromeKeydown);
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.addEventListener('pointermove', this.onPointerMove, {
      capture: true,
      passive: true
    });
    document.addEventListener('keydown', this.onDocumentKeydown, true);
    window.addEventListener('scroll', this.onViewportChange, {
      capture: true,
      passive: true
    });
    window.addEventListener('resize', this.onViewportChange);
    this.mounted = true;
  }
  destroy() {
    if (!this.mounted) return;
    this.quill.root.removeEventListener('pointerover', this.onPointerOver);
    this.quill.root.removeEventListener('pointerout', this.onPointerOut);
    this.el.removeEventListener('pointerenter', this.cancelHide);
    this.el.removeEventListener('pointerleave', this.onChromePointerLeave);
    this.el.removeEventListener('mousedown', this.keepEditorSelection);
    this.el.removeEventListener('click', this.onChromeClick);
    this.el.removeEventListener('keydown', this.onChromeKeydown);
    this.confirmEl.removeEventListener('mousedown', this.keepEditorSelection);
    this.confirmEl.removeEventListener('click', this.onConfirmClick);
    this.confirmEl.removeEventListener('keydown', this.onChromeKeydown);
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.removeEventListener('pointermove', this.onPointerMove, {
      capture: true
    });
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
    window.removeEventListener('scroll', this.onViewportChange, {
      capture: true
    });
    window.removeEventListener('resize', this.onViewportChange);
    this.closeMenu();
    this.cancelShow();
    this.cancelHide();
    this.confirmEl.remove();
    this.el.remove();
    this.mounted = false;
    this.currentLayout = null;
  }

  /** Re-anchor the chrome on a layout node after a structural change. */
  retarget(layoutNode) {
    if (!layoutNode) {
      this.hide();
      return;
    }
    this.currentLayout = layoutNode;
    this.show(layoutNode);
  }

  /** Refresh the badge/button state after an external mutation (ratio change). */
  refresh() {
    if (this.el.hidden || !this.currentLayout) return;
    this.renderState();
    this.schedulePosition();
  }
  buildToolbar() {
    const presetButton = this.createButton('presets', 'Choose a layout', 'Choose a layout');
    presetButton.classList.add('ql-layout-chrome__btn--presets');
    presetButton.setAttribute('aria-haspopup', 'menu');
    presetButton.setAttribute('aria-expanded', 'false');
    presetButton.insertAdjacentHTML('beforeend', "<span class=\"ql-layout-chrome__caret\">" + ICONS.caret + "</span>");
    const addButton = this.createButton('add', 'Add column', 'Add a column');
    const removeButton = this.createButton('remove', 'Remove column', 'Remove the active column');
    const duplicateButton = this.createButton('duplicate', 'Duplicate layout', 'Duplicate this layout');
    const unwrapButton = this.createButton('unwrap', 'Remove layout', 'Remove the layout and keep the content');
    this.el.append(this.badge, presetButton, addButton, removeButton, duplicateButton, unwrapButton, this.status);
  }
  createButton(action, label, title) {
    var _ICONS$action;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ql-layout-chrome__btn';
    button.dataset.action = action;
    button.title = title;
    button.setAttribute('aria-label', label);
    button.innerHTML = (_ICONS$action = ICONS[action]) != null ? _ICONS$action : '';
    this.buttons[action] = button;
    return button;
  }

  /** Called by `Layout` when the caret moves into (or out of) a column. */
  handleActiveColumnChange(column) {
    if (!column) {
      var _this$menuEl3;
      const focused = document.activeElement;
      const interacting = !!focused && (this.el.contains(focused) || this.confirmEl.contains(focused) || !!((_this$menuEl3 = this.menuEl) != null && _this$menuEl3.contains(focused)));
      if (!interacting) this.scheduleHide();
      return;
    }
    const layoutNode = this.layout.findLayout(column);
    if (!layoutNode) return;
    this.show(layoutNode);
  }
  show(layoutNode) {
    if (!this.isEditable()) return;
    this.cancelShow();
    this.cancelHide();
    this.currentLayout = layoutNode;
    this.el.hidden = false;
    this.renderState();
    this.schedulePosition();
  }
  hide() {
    this.cancelShow();
    this.cancelHide();
    this.closeMenu();
    this.cancelConfirm();
    this.el.hidden = true;
    this.currentLayout = null;
  }
  isEditable() {
    return this.quill.root.getAttribute('contenteditable') !== 'false';
  }
  renderState() {
    const node = this.currentLayout;
    if (!node) return;
    const value = this.layout.getLayoutValue(node);
    const activeIndex = this.layout.getActiveColumnIndex(node);
    this.badge.textContent = this.describe(value, activeIndex);
    const removeButton = this.buttons.remove;
    const cannotRemove = value.cols <= 2;
    removeButton.disabled = cannotRemove;
    removeButton.setAttribute('aria-disabled', cannotRemove ? 'true' : 'false');
    removeButton.title = cannotRemove ? 'A layout needs at least two columns. Use "Remove layout" instead.' : 'Remove the active column';
    this.buttons.add.disabled = false;
    this.buttons.duplicate.disabled = false;
    this.buttons.unwrap.disabled = false;
  }
  describe(value, activeIndex) {
    const columns = value.cols + " " + (value.cols === 1 ? 'column' : 'columns');
    const active = activeIndex >= 0 ? " \xB7 column " + (activeIndex + 1) : '';
    return "" + columns + active + " \xB7 " + this.ratioLabel(value);
  }
  ratioLabel(value) {
    const key = value.ratios.join('|');
    const preset = this.layout.getPresets().find(item => item.cols === value.cols && item.ratios.join('|') === key);
    if (preset) return preset.label;
    return value.ratios.map(ratio => {
      const numeric = parseFloat(ratio);
      return Number.isFinite(numeric) ? numeric + "fr" : ratio;
    }).join(' / ');
  }
  maybeScheduleHide(x, y) {
    if (this.isPointerInInteractiveZone(x, y)) {
      this.cancelHide();
      return;
    }
    this.scheduleHide();
  }
  isPointerInInteractiveZone(x, y) {
    const targets = [this.el, this.currentLayout, this.menuEl, this.confirmEl.hidden ? null : this.confirmEl];
    const margin = INTERACTIVE_MARGIN;
    return targets.some(target => {
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      return x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin;
    });
  }
  scheduleHide() {
    this.cancelShow();
    if (this.hideTimer) return;
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.hide();
    }, HIDE_DELAY);
  }
  cancelHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
  cancelShow() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }
  schedulePosition() {
    if (this.frame !== null) return;
    this.frame = window.requestAnimationFrame(() => {
      this.frame = null;
      this.position();
    });
  }
  position() {
    const node = this.currentLayout;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const chromeRect = this.el.getBoundingClientRect();
    const chromeHeight = chromeRect.height || 30;
    const chromeWidth = chromeRect.width || 180;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    let top = rect.top - chromeHeight - 6;
    if (top < VIEWPORT_MARGIN) top = rect.bottom + 6;
    let left = rect.right - chromeWidth;
    if (viewportWidth > 0) {
      left = Math.min(left, viewportWidth - chromeWidth - VIEWPORT_MARGIN);
    }
    left = Math.max(VIEWPORT_MARGIN, left);
    this.el.style.top = Math.round(top) + "px";
    this.el.style.left = Math.round(left) + "px";
  }
  addColumn() {
    const node = this.currentLayout;
    if (!node) return;
    const activeIndex = this.layout.getActiveColumnIndex(node);
    const next = this.layout.addColumn(node, activeIndex >= 0 ? activeIndex : undefined);
    this.afterStructureChange(next, 'Column added.');
  }
  requestRemoveColumn() {
    var _this$confirmEl$query;
    const node = this.currentLayout;
    if (!node) return;
    const value = this.layout.getLayoutValue(node);
    if (value.cols <= 2) return;
    const activeIndex = this.layout.getActiveColumnIndex(node);
    if (activeIndex < 0) {
      this.announce('Select a column first.');
      return;
    }
    const columns = this.layout.getColumnElements(node);
    if (this.layout.isColumnEmpty(columns[activeIndex])) {
      const next = this.layout.removeColumn(node, activeIndex);
      this.afterStructureChange(next, 'Column removed.');
      return;
    }
    this.pendingRemoval = activeIndex;
    this.confirmText.textContent = 'This column contains content. Remove it anyway?';
    this.confirmEl.hidden = false;
    (_this$confirmEl$query = this.confirmEl.querySelector('button[data-confirm="cancel"]')) == null || _this$confirmEl$query.focus();
  }
  confirmRemoveColumn() {
    const node = this.currentLayout;
    const index = this.pendingRemoval;
    this.cancelConfirm();
    if (!node || index === null) return;
    const next = this.layout.removeColumn(node, index);
    this.afterStructureChange(next, 'Column removed.');
  }
  cancelConfirm() {
    this.pendingRemoval = null;
    this.confirmEl.hidden = true;
  }
  duplicateLayout() {
    const node = this.currentLayout;
    if (!node) return;
    const next = this.layout.duplicateLayout(node);
    this.afterStructureChange(next, 'Layout duplicated.');
  }
  unwrapLayout() {
    const node = this.currentLayout;
    if (!node) return;
    this.layout.unwrapLayout(node);
    this.hide();
    this.announce('Layout removed, content preserved.');
  }
  afterStructureChange(node, message) {
    this.cancelConfirm();
    this.retarget(node);
    this.announce(message);
  }
  announce(message) {
    this.status.textContent = message;
  }
  toggleMenu() {
    if (this.menuEl) {
      this.closeMenu();
      return;
    }
    this.openMenu();
  }
  openMenu() {
    var _menu$querySelector;
    const node = this.currentLayout;
    if (!node) return;
    const menu = document.createElement('div');
    menu.className = 'ql-layout-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Choose a layout');
    this.layout.getPresets().forEach((preset, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'ql-layout-menu__item';
      item.setAttribute('role', 'menuitem');
      item.dataset.index = String(index);
      item.innerHTML = "<span class=\"ql-layout-menu__bars\">" + this.renderBars(preset) + "</span><span>" + preset.label + "</span>";
      item.addEventListener('click', event => {
        event.preventDefault();
        this.applyPreset(preset);
      });
      menu.appendChild(item);
    });
    menu.addEventListener('mousedown', this.keepEditorSelection);
    menu.addEventListener('keydown', this.onMenuKeydown);
    const host = this.el.parentElement;
    if (!host) return;
    host.appendChild(menu);
    this.menuEl = menu;
    this.buttons.presets.setAttribute('aria-expanded', 'true');
    this.positionMenu();
    ((_menu$querySelector = menu.querySelector('button')) != null ? _menu$querySelector : menu).focus();
  }
  positionMenu() {
    const menu = this.menuEl;
    if (!menu) return;
    const buttonRect = this.buttons.presets.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const menuRect = menu.getBoundingClientRect();
    let left = buttonRect.left;
    if (viewportWidth > 0) {
      left = Math.min(left, viewportWidth - (menuRect.width || 150) - VIEWPORT_MARGIN);
    }
    menu.style.top = Math.round(buttonRect.bottom + 6) + "px";
    menu.style.left = Math.round(Math.max(VIEWPORT_MARGIN, left)) + "px";
  }
  closeMenu() {
    var _this$menuEl4, _this$buttons$presets;
    (_this$menuEl4 = this.menuEl) == null || _this$menuEl4.remove();
    this.menuEl = null;
    (_this$buttons$presets = this.buttons.presets) == null || _this$buttons$presets.setAttribute('aria-expanded', 'false');
  }
  applyPreset(preset) {
    const node = this.currentLayout;
    this.closeMenu();
    if (!node) return;
    const next = this.layout.applyPreset(node, preset);
    this.afterStructureChange(next, "Layout set to " + preset.label + ".");
  }
  renderBars(preset) {
    return preset.ratios.map(ratio => {
      const numeric = parseFloat(ratio);
      const grow = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
      return "<span class=\"ql-layout-menu__bar\" style=\"flex-grow: " + grow + "\"></span>";
    }).join('');
  }
  focusEditor() {
    const quill = this.quill;
    quill.focus == null || quill.focus();
  }
}