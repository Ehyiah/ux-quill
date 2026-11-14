import type Quill from 'quill';
import type { Layout, LayoutPreset } from './layout.ts';
import type { LayoutValue } from '../blots/layout.ts';

export type LayoutChromeConfig = {
    showBadge: boolean;
};

const SHOW_DELAY = 150;
const HIDE_DELAY = 320;
const VIEWPORT_MARGIN = 8;
const INTERACTIVE_MARGIN = 12;

const ICONS: Record<string, string> = {
    presets: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="14" height="12" rx="1.5"/><line x1="9" y1="3" x2="9" y2="15"/></svg>',
    caret: '<svg viewBox="0 0 10 6" width="8" height="5" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>',
    add: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="9" y1="3" x2="9" y2="15"/><line x1="3" y1="9" x2="15" y2="9"/></svg>',
    remove: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="9" x2="15" y2="9"/></svg>',
    duplicate: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="9" height="9" rx="1"/><rect x="6" y="6" width="9" height="9" rx="1"/></svg>',
    unwrap: '<svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="14" height="12" rx="1.5"/><line x1="4" y1="14" x2="14" y2="4"/></svg>',
};

export class LayoutChrome {
    private quill: Quill;
    private layout: Layout;
    private config: LayoutChromeConfig;

    private el: HTMLDivElement;
    private badge: HTMLSpanElement;
    private status: HTMLSpanElement;
    private confirmEl: HTMLDivElement;
    private confirmText: HTMLParagraphElement;
    private menuEl: HTMLDivElement | null = null;
    private buttons: Record<string, HTMLButtonElement> = {};

    private currentLayout: HTMLElement | null = null;
    private pendingLayout: HTMLElement | null = null;
    private pendingRemoval: number | null = null;
    private showTimer: ReturnType<typeof setTimeout> | null = null;
    private hideTimer: ReturnType<typeof setTimeout> | null = null;
    private frame: number | null = null;
    private mounted = false;

    constructor(quill: Quill, layout: Layout, config: LayoutChromeConfig) {
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

    mount(): void {
        if (this.mounted) return;

        const host = (this.quill.container as HTMLElement | null) ?? this.quill.root.parentElement;
        if (!host) return;

        host.appendChild(this.el);

        (this.quill.root as HTMLElement).addEventListener('pointerover', this.onPointerOver);
        (this.quill.root as HTMLElement).addEventListener('pointerout', this.onPointerOut);
        this.el.addEventListener('pointerenter', this.cancelHide);
        this.el.addEventListener('pointerleave', this.onChromePointerLeave);
        this.el.addEventListener('mousedown', this.keepEditorSelection);
        this.el.addEventListener('click', this.onChromeClick);
        this.el.addEventListener('keydown', this.onChromeKeydown);
        this.confirmEl.addEventListener('mousedown', this.keepEditorSelection);
        this.confirmEl.addEventListener('click', this.onConfirmClick);
        this.confirmEl.addEventListener('keydown', this.onChromeKeydown);

        document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
        document.addEventListener('pointermove', this.onPointerMove, { capture: true, passive: true });
        document.addEventListener('keydown', this.onDocumentKeydown, true);
        window.addEventListener('scroll', this.onViewportChange, { capture: true, passive: true });
        window.addEventListener('resize', this.onViewportChange);

        this.mounted = true;
    }

    destroy(): void {
        if (!this.mounted) return;

        (this.quill.root as HTMLElement).removeEventListener('pointerover', this.onPointerOver);
        (this.quill.root as HTMLElement).removeEventListener('pointerout', this.onPointerOut);
        this.el.removeEventListener('pointerenter', this.cancelHide);
        this.el.removeEventListener('pointerleave', this.onChromePointerLeave);
        this.el.removeEventListener('mousedown', this.keepEditorSelection);
        this.el.removeEventListener('click', this.onChromeClick);
        this.el.removeEventListener('keydown', this.onChromeKeydown);
        this.confirmEl.removeEventListener('mousedown', this.keepEditorSelection);
        this.confirmEl.removeEventListener('click', this.onConfirmClick);
        this.confirmEl.removeEventListener('keydown', this.onChromeKeydown);

        document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
        document.removeEventListener('pointermove', this.onPointerMove, { capture: true });
        document.removeEventListener('keydown', this.onDocumentKeydown, true);
        window.removeEventListener('scroll', this.onViewportChange, { capture: true });
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
    retarget(layoutNode: HTMLElement | null): void {
        if (!layoutNode) {
            this.hide();
            return;
        }

        this.currentLayout = layoutNode;
        this.show(layoutNode);
    }

    /** Refresh the badge/button state after an external mutation (ratio change). */
    refresh(): void {
        if (this.el.hidden || !this.currentLayout) return;

        this.renderState();
        this.schedulePosition();
    }

    private buildToolbar(): void {
        const presetButton = this.createButton('presets', 'Choose a layout', 'Choose a layout');
        presetButton.classList.add('ql-layout-chrome__btn--presets');
        presetButton.setAttribute('aria-haspopup', 'menu');
        presetButton.setAttribute('aria-expanded', 'false');
        presetButton.insertAdjacentHTML('beforeend', `<span class="ql-layout-chrome__caret">${ICONS.caret}</span>`);

        const addButton = this.createButton('add', 'Add column', 'Add a column');
        const removeButton = this.createButton('remove', 'Remove column', 'Remove the active column');
        const duplicateButton = this.createButton('duplicate', 'Duplicate layout', 'Duplicate this layout');
        const unwrapButton = this.createButton('unwrap', 'Remove layout', 'Remove the layout and keep the content');

        this.el.append(
            this.badge,
            presetButton,
            addButton,
            removeButton,
            duplicateButton,
            unwrapButton,
            this.status
        );
    }

    private createButton(action: string, label: string, title: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ql-layout-chrome__btn';
        button.dataset.action = action;
        button.title = title;
        button.setAttribute('aria-label', label);
        button.innerHTML = ICONS[action] ?? '';
        this.buttons[action] = button;

        return button;
    }

    /** Called by `Layout` when the caret moves into (or out of) a column. */
    handleActiveColumnChange(column: HTMLElement | null): void {
        if (!column) {
            const focused = document.activeElement;
            const interacting = !!focused && (
                this.el.contains(focused) || this.confirmEl.contains(focused) || !!this.menuEl?.contains(focused)
            );

            if (!interacting) this.scheduleHide();
            return;
        }

        const layoutNode = this.layout.findLayout(column);
        if (!layoutNode) return;

        this.show(layoutNode);
    }

    private show(layoutNode: HTMLElement): void {
        if (!this.isEditable()) return;

        this.cancelShow();
        this.cancelHide();

        this.currentLayout = layoutNode;
        this.el.hidden = false;
        this.renderState();
        this.schedulePosition();
    }

    private hide(): void {
        this.cancelShow();
        this.cancelHide();
        this.closeMenu();
        this.cancelConfirm();
        this.el.hidden = true;
        this.currentLayout = null;
    }

    private isEditable(): boolean {
        return (this.quill.root as HTMLElement).getAttribute('contenteditable') !== 'false';
    }

    private renderState(): void {
        const node = this.currentLayout;
        if (!node) return;

        const value = this.layout.getLayoutValue(node);
        const activeIndex = this.layout.getActiveColumnIndex(node);

        this.badge.textContent = this.describe(value, activeIndex);

        const removeButton = this.buttons.remove;
        const cannotRemove = value.cols <= 2;
        removeButton.disabled = cannotRemove;
        removeButton.setAttribute(
            'aria-disabled',
            cannotRemove ? 'true' : 'false'
        );
        removeButton.title = cannotRemove
            ? 'A layout needs at least two columns. Use "Remove layout" instead.'
            : 'Remove the active column';

        this.buttons.add.disabled = false;
        this.buttons.duplicate.disabled = false;
        this.buttons.unwrap.disabled = false;
    }

    private describe(value: LayoutValue, activeIndex: number): string {
        const columns = `${value.cols} ${value.cols === 1 ? 'column' : 'columns'}`;
        const active = activeIndex >= 0 ? ` · column ${activeIndex + 1}` : '';

        return `${columns}${active} · ${this.ratioLabel(value)}`;
    }

    private ratioLabel(value: LayoutValue): string {
        const key = value.ratios.join('|');
        const preset = this.layout
            .getPresets()
            .find((item) => item.cols === value.cols && item.ratios.join('|') === key);

        if (preset) return preset.label;

        return value.ratios
            .map((ratio) => {
                const numeric = parseFloat(ratio);

                return Number.isFinite(numeric) ? `${numeric}fr` : ratio;
            })
            .join(' / ');
    }

    private onPointerOver = (event: Event): void => {
        const target = event.target as Element | null;
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

    private onPointerOut = (event: Event): void => {
        const related = (event as PointerEvent).relatedTarget as Node | null;
        if (related && (
            this.el.contains(related) ||
            this.confirmEl.contains(related) ||
            this.menuEl?.contains(related)
        )) return;
        if (related && this.currentLayout && this.currentLayout.contains(related)) return;

        const pointer = event as PointerEvent;
        this.maybeScheduleHide(pointer.clientX, pointer.clientY);
    };

    /**
     * Tracks the pointer while the chrome is visible so that crossing the gap
     * between the layout and the floating toolbar never hides it.
     */
    private onPointerMove = (event: PointerEvent): void => {
        if (this.el.hidden) return;

        this.maybeScheduleHide(event.clientX, event.clientY);
    };

    private maybeScheduleHide(x: number, y: number): void {
        if (this.isPointerInInteractiveZone(x, y)) {
            this.cancelHide();
            return;
        }

        this.scheduleHide();
    }

    private isPointerInInteractiveZone(x: number, y: number): boolean {
        const targets = [this.el, this.currentLayout, this.menuEl, this.confirmEl.hidden ? null : this.confirmEl];
        const margin = INTERACTIVE_MARGIN;

        return targets.some((target) => {
            if (!target) return false;

            const rect = target.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;

            return x >= rect.left - margin &&
                x <= rect.right + margin &&
                y >= rect.top - margin &&
                y <= rect.bottom + margin;
        });
    }

    private onChromePointerLeave = (event: Event): void => {
        const related = (event as PointerEvent).relatedTarget as Node | null;
        if (related && this.quill.root && (this.quill.root as HTMLElement).contains(related)) {
            const layoutNode = this.layout.findLayout(related as Element);
            if (layoutNode === this.currentLayout) return;
        }

        const pointer = event as PointerEvent;
        this.maybeScheduleHide(pointer.clientX, pointer.clientY);
    };

    private scheduleHide(): void {
        this.cancelShow();
        if (this.hideTimer) return;

        this.hideTimer = setTimeout(() => {
            this.hideTimer = null;
            this.hide();
        }, HIDE_DELAY);
    }

    private cancelHide(): void {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    private cancelShow(): void {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }

    private keepEditorSelection = (event: Event): void => {
        if ((event.target as Element | null)?.closest('button')) {
            event.preventDefault();
        }
    };

    private onChromeClick = (event: Event): void => {
        const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-action]');
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

    private onChromeKeydown = (event: KeyboardEvent): void => {
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

    private onMenuKeydown = (event: KeyboardEvent): void => {
        const menu = this.menuEl;
        if (!menu) return;

        const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('.ql-layout-menu__item'));
        if (items.length === 0) return;

        const current = items.indexOf(document.activeElement as HTMLButtonElement);

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

    private onConfirmClick = (event: Event): void => {
        const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-confirm]');
        if (!button) return;

        event.preventDefault();

        if (button.dataset.confirm === 'ok') {
            this.confirmRemoveColumn();
        } else {
            this.cancelConfirm();
        }
    };

    private onDocumentPointerDown = (event: Event): void => {
        const target = event.target as Node | null;
        if (!target) return;

        if (this.menuEl && !this.menuEl.contains(target) && !this.el.contains(target)) {
            this.closeMenu();
        }

        if (!this.confirmEl.hidden && !this.confirmEl.contains(target) && !this.el.contains(target)) {
            this.cancelConfirm();
        }
    };

    private onDocumentKeydown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape' || this.el.hidden) return;

        const target = event.target as Node | null;
        if (target && (this.el.contains(target) || this.menuEl?.contains(target))) return;

        this.hide();
    };

    private onViewportChange = (): void => {
        if (this.el.hidden) return;
        this.schedulePosition();
    };

    private schedulePosition(): void {
        if (this.frame !== null) return;

        this.frame = window.requestAnimationFrame(() => {
            this.frame = null;
            this.position();
        });
    }

    private position(): void {
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

        this.el.style.top = `${Math.round(top)}px`;
        this.el.style.left = `${Math.round(left)}px`;
    }

    private addColumn(): void {
        const node = this.currentLayout;
        if (!node) return;

        const activeIndex = this.layout.getActiveColumnIndex(node);
        const next = this.layout.addColumn(node, activeIndex >= 0 ? activeIndex : undefined);

        this.afterStructureChange(next, 'Column added.');
    }

    private requestRemoveColumn(): void {
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
        this.confirmEl.querySelector<HTMLButtonElement>('button[data-confirm="cancel"]')?.focus();
    }

    private confirmRemoveColumn(): void {
        const node = this.currentLayout;
        const index = this.pendingRemoval;

        this.cancelConfirm();

        if (!node || index === null) return;

        const next = this.layout.removeColumn(node, index);
        this.afterStructureChange(next, 'Column removed.');
    }

    private cancelConfirm(): void {
        this.pendingRemoval = null;
        this.confirmEl.hidden = true;
    }

    private duplicateLayout(): void {
        const node = this.currentLayout;
        if (!node) return;

        const next = this.layout.duplicateLayout(node);
        this.afterStructureChange(next, 'Layout duplicated.');
    }

    private unwrapLayout(): void {
        const node = this.currentLayout;
        if (!node) return;

        this.layout.unwrapLayout(node);
        this.hide();
        this.announce('Layout removed, content preserved.');
    }

    private afterStructureChange(node: HTMLElement | null, message: string): void {
        this.cancelConfirm();
        this.retarget(node);
        this.announce(message);
    }

    private announce(message: string): void {
        this.status.textContent = message;
    }

    private toggleMenu(): void {
        if (this.menuEl) {
            this.closeMenu();

            return;
        }

        this.openMenu();
    }

    private openMenu(): void {
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
            item.innerHTML = `<span class="ql-layout-menu__bars">${this.renderBars(preset)}</span><span>${preset.label}</span>`;
            item.addEventListener('click', (event) => {
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
        (menu.querySelector<HTMLButtonElement>('button') ?? menu).focus();
    }

    private positionMenu(): void {
        const menu = this.menuEl;
        if (!menu) return;

        const buttonRect = this.buttons.presets.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        const menuRect = menu.getBoundingClientRect();

        let left = buttonRect.left;
        if (viewportWidth > 0) {
            left = Math.min(left, viewportWidth - (menuRect.width || 150) - VIEWPORT_MARGIN);
        }

        menu.style.top = `${Math.round(buttonRect.bottom + 6)}px`;
        menu.style.left = `${Math.round(Math.max(VIEWPORT_MARGIN, left))}px`;
    }

    private closeMenu(): void {
        this.menuEl?.remove();
        this.menuEl = null;
        this.buttons.presets?.setAttribute('aria-expanded', 'false');
    }

    private applyPreset(preset: LayoutPreset): void {
        const node = this.currentLayout;
        this.closeMenu();
        if (!node) return;

        const next = this.layout.applyPreset(node, preset);
        this.afterStructureChange(next, `Layout set to ${preset.label}.`);
    }

    private renderBars(preset: LayoutPreset): string {
        return preset.ratios
            .map((ratio) => {
                const numeric = parseFloat(ratio);
                const grow = Number.isFinite(numeric) && numeric > 0 ? numeric : 1;

                return `<span class="ql-layout-menu__bar" style="flex-grow: ${grow}"></span>`;
            })
            .join('');
    }

    private focusEditor(): void {
        const quill = this.quill as unknown as { focus?: () => void };
        quill.focus?.();
    }
}
