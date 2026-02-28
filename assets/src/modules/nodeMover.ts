import Quill from 'quill';
import Delta from 'quill-delta';

export interface NodeMoverOptions {
    borderColor?: string;
    dropIndicatorColor?: string;
    handleHTML?: string;
    duplicate?: boolean;
}

const ICONS = {
    move: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>',
    up: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    down: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    duplicate: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    delete: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
};

export default class NodeMover {
    private quill: Quill;
    private options: NodeMoverOptions;
    private container: HTMLElement;
    private toolbar: HTMLElement | null = null;
    private overlay: HTMLElement | null = null;
    private dropIndicator: HTMLElement | null = null;
    private currentBlocks: HTMLElement[] = [];
    private selectionRange: { index: number, length: number } | null = null;
    private dragTarget: { index: number, length: number } | null = null;
    private hideTimeout: any = null;
    private lastMouseEvent: MouseEvent | null = null;

    constructor(quill: Quill, options: NodeMoverOptions = {}) {
        this.quill = quill;
        this.options = {
            borderColor: '#007bff',
            dropIndicatorColor: '#ff0000', // Red as default
            duplicate: true,
            ...options
        };

        this.container = quill.container;
        this.injectStyles();
        this.createToolbar();
        this.createOverlay();
        this.createDropIndicator();

        this.quill.root.addEventListener('mousedown', (e) => {
            this.lastMouseEvent = e;
            this.handleSelection(e);
        });
        
        this.quill.root.addEventListener('keyup', () => {
            this.lastMouseEvent = null;
            this.handleSelection();
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.hideTimeout = setTimeout(() => this.hideToolbar(), 300);
        });

        this.container.addEventListener('mouseenter', () => {
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        });

        if (this.toolbar) {
            this.toolbar.addEventListener('mouseenter', () => {
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
            });
            this.toolbar.addEventListener('mouseleave', () => {
                this.hideTimeout = setTimeout(() => this.hideToolbar(), 300);
            });
        }
        
        // Drop events on the editor
        this.quill.root.addEventListener('dragover', this.handleDragOver.bind(this));
        this.quill.root.addEventListener('drop', this.handleDrop.bind(this));

        this.quill.on('selection-change', (range) => {
            if (range) {
                this.lastMouseEvent = null;
                this.handleSelection();
            } else {
                // If range is lost, we check if we still have a valid mouse event target (like an image)
                setTimeout(() => {
                    if (!this.quill.getSelection() && !this.lastMouseEvent) {
                        this.hideToolbar();
                    }
                }, 100);
            }
        });

        this.quill.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                this.hideToolbar();
            } else {
                this.repositionToolbar();
            }
        });
        
        this.quill.root.addEventListener('scroll', () => this.repositionToolbar());
    }

    private injectStyles() {
        const styleId = 'ql-node-mover-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .ql-node-mover-toolbar {
                position: absolute;
                display: none;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 2px;
                z-index: 1000;
                flex-direction: column;
                gap: 1px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                pointer-events: auto;
            }
            .ql-node-mover-toolbar button {
                background: transparent;
                border: none;
                color: #666;
                padding: 2px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 2px;
                transition: background 0.2s, color 0.2s;
                width: 20px;
                height: 20px;
            }
            .ql-node-mover-toolbar button:hover {
                background: #f0f0f0;
                color: #333;
            }
            .ql-node-mover-handle {
                cursor: move !important;
                color: #999 !important;
            }
            .ql-node-mover-overlay {
                position: absolute;
                display: none;
                border: 2px solid ${this.options.borderColor};
                pointer-events: none;
                z-index: 999;
                border-radius: 2px;
            }
            .ql-node-mover-drop-indicator {
                position: absolute;
                display: none;
                height: 4px;
                background: ${this.options.dropIndicatorColor};
                pointer-events: none;
                z-index: 1001;
                border-radius: 2px;
                transition: top 0.05s ease;
            }
            .ql-node-mover-dragging {
                opacity: 0.5 !important;
            }
        `;
        document.head.appendChild(style);
    }

    private createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'ql-node-mover-toolbar';

        const btnUp = this.createButton(ICONS.up, 'Move Up', () => this.moveNodes('up'));
        const btnDown = this.createButton(ICONS.down, 'Move Down', () => this.moveNodes('down'));

        // Drag Handle
        const handle = document.createElement('button');
        handle.innerHTML = ICONS.move;
        handle.className = 'ql-node-mover-handle';
        handle.title = 'Drag to move';
        handle.setAttribute('draggable', 'true');
        handle.addEventListener('dragstart', this.handleDragStart.bind(this));
        handle.addEventListener('dragend', this.handleDragEnd.bind(this));

        const btnDel = this.createButton(ICONS.delete, 'Delete', () => this.deleteNodes());
        btnDel.style.color = '#ff4d4d';

        this.toolbar.appendChild(btnUp);
        this.toolbar.appendChild(handle);
        this.toolbar.appendChild(btnDown);

        if (this.options.duplicate) {
            const btnDuplicate = this.createButton(ICONS.duplicate, 'Duplicate', () => this.duplicateNodes());
            this.toolbar.appendChild(btnDuplicate);
        }

        this.toolbar.appendChild(btnDel);

        this.container.appendChild(this.toolbar);
    }

    private createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'ql-node-mover-overlay';
        this.container.appendChild(this.overlay);
    }

    private createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'ql-node-mover-drop-indicator';
        this.container.appendChild(this.dropIndicator);
    }

    private createButton(html: string, title: string, onClick: () => void): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.innerHTML = html;
        btn.title = title;
        btn.type = 'button';
        btn.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        return btn;
    }

    private handleSelection(event?: MouseEvent) {
        // Debounce slightly to allow Quill to update its selection
        setTimeout(() => {
            const range = this.quill.getSelection();
            let blocks: HTMLElement[] = [];
            let selectionFound = false;

            if (range && range.length > 0) {
                // Multi-line selection or text selection
                this.selectionRange = { index: range.index, length: range.length };
                const lines = this.quill.getLines(range.index, range.length);
                blocks = lines.map(line => line.domNode as HTMLElement);
                selectionFound = true;
            } else {
                // Single point (cursor) or clicked element (embeds/images)
                const target = event?.target as HTMLElement || this.lastMouseEvent?.target as HTMLElement;
                
                if (target && this.quill.root.contains(target)) {
                    const block = this.findBlock(target);
                    if (block) {
                        const blot = Quill.find(block);
                        if (blot) {
                            // @ts-ignore
                            this.selectionRange = { index: this.quill.getIndex(blot), length: blot.length() };
                            blocks = [block];
                            selectionFound = true;
                        }
                    }
                }

                // If still no blocks but we have a cursor range, fallback to that line
                if (!selectionFound && range) {
                    this.selectionRange = { index: range.index, length: range.length };
                    const [line] = this.quill.getLine(range.index);
                    if (line) {
                        blocks = [line.domNode as HTMLElement];
                        selectionFound = true;
                    }
                }
            }

            // Filter out empty lines if it's just a cursor in an empty paragraph
            if (blocks.length === 1 && range && range.length === 0) {
                const [line] = this.quill.getLine(range.index);
                if (line && line.length() <= 1 && line.domNode.textContent === '') {
                    this.hideToolbar();
                    return;
                }
            }

            if (blocks.length > 0) {
                this.showToolbar(blocks);
            } else {
                this.hideToolbar();
            }
        }, 50);
    }

    private findBlock(el: HTMLElement | null): HTMLElement | null {
        let current = el;
        while (current && current !== this.quill.root) {
            if (current.parentElement === this.quill.root) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    private showToolbar(blocks: HTMLElement[]) {
        if (this.dragTarget) return;

        this.quill.root.querySelectorAll('.ql-node-mover-active-block').forEach(el => {
            el.classList.remove('ql-node-mover-active-block');
        });
        
        this.currentBlocks = blocks;
        this.currentBlocks.forEach(b => b.classList.add('ql-node-mover-active-block'));

        this.repositionToolbar();
    }

    private repositionToolbar() {
        if (this.currentBlocks.length === 0 || !this.toolbar || !this.overlay) return;

        if (!this.quill.root.contains(this.currentBlocks[0])) {
            this.hideToolbar();
            return;
        }

        const containerRect = this.container.getBoundingClientRect();
        
        let minTop = Infinity;
        let maxBottom = -Infinity;
        let minLeft = Infinity;
        let maxRight = -Infinity;

        this.currentBlocks.forEach(block => {
            const r = block.getBoundingClientRect();
            if (r.top < minTop) minTop = r.top;
            if (r.bottom > maxBottom) maxBottom = r.bottom;
            if (r.left < minLeft) minLeft = r.left;
            if (r.right > maxRight) maxRight = r.right;
        });

        const padding = 2;
        this.overlay.style.display = 'block';
        this.overlay.style.top = `${minTop - containerRect.top - padding}px`;
        this.overlay.style.left = `${minLeft - containerRect.left - padding}px`;
        this.overlay.style.width = `${(maxRight - minLeft) + (padding * 2)}px`;
        this.overlay.style.height = `${(maxBottom - minTop) + (padding * 2)}px`;

        this.toolbar.style.display = 'flex';
        const top = minTop - containerRect.top;
        
        const rootRect = this.quill.root.getBoundingClientRect();
        const toolbarWidth = this.toolbar.offsetWidth || 26;
        let left = rootRect.left - containerRect.left - toolbarWidth - 5;

        // If it would be off-screen (viewport left), move it inside
        if (rootRect.left < toolbarWidth + 10) {
            left = rootRect.left - containerRect.left + 5;
        }

        this.toolbar.style.top = `${top}px`;
        this.toolbar.style.left = `${left}px`;
    }

    private hideToolbar() {
        if (this.dragTarget) return;
        if (this.toolbar) {
            this.toolbar.style.display = 'none';
        }
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        this.quill.root.querySelectorAll('.ql-node-mover-active-block').forEach(el => {
            el.classList.remove('ql-node-mover-active-block');
        });
        this.currentBlocks.forEach(b => b.classList.remove('ql-node-mover-active-block'));
        this.currentBlocks = [];
        this.selectionRange = null;
    }

    private moveNodes(direction: 'up' | 'down') {
        if (!this.selectionRange || this.currentBlocks.length === 0) return;

        const range = this.selectionRange;
        const lines = this.quill.getLines(range.index, range.length || 1);
        if (lines.length === 0) return;

        const firstBlot = lines[0];
        const lastBlot = lines[lines.length - 1];

        const startIndex = this.quill.getIndex(firstBlot);
        const endIndex = this.quill.getIndex(lastBlot) + lastBlot.length();
        const totalLength = endIndex - startIndex;

        const contents = this.quill.getContents(startIndex, totalLength);

        if (direction === 'up') {
            const prev = firstBlot.prev;
            if (prev) {
                const prevIndex = this.quill.getIndex(prev);
                this.quill.updateContents(new Delta().retain(startIndex).delete(totalLength), 'user');
                this.quill.updateContents(new Delta().retain(prevIndex).concat(contents), 'user');
                this.quill.setSelection(prevIndex, totalLength);
            }
        } else {
            const next = lastBlot.next;
            if (next) {
                const nextIndex = this.quill.getIndex(next);
                // @ts-ignore
                const nextLength = next.length();
                this.quill.updateContents(new Delta().retain(nextIndex + nextLength).concat(contents), 'user');
                this.quill.updateContents(new Delta().retain(startIndex).delete(totalLength), 'user');
                this.quill.setSelection(nextIndex + nextLength - totalLength, totalLength);
            }
        }
    }

    private duplicateNodes() {
        if (!this.selectionRange || this.currentBlocks.length === 0) return;

        const range = this.selectionRange;
        const lines = this.quill.getLines(range.index, range.length || 1);
        if (lines.length === 0) return;

        const firstBlot = lines[0];
        const lastBlot = lines[lines.length - 1];

        const startIndex = this.quill.getIndex(firstBlot);
        const endIndex = this.quill.getIndex(lastBlot) + lastBlot.length();
        const totalLength = endIndex - startIndex;

        const contents = this.quill.getContents(startIndex, totalLength);

        this.quill.updateContents(new Delta().retain(endIndex).concat(contents), 'user');
        this.quill.setSelection(endIndex, totalLength, 'user');
    }

    private deleteNodes() {
        if (!this.selectionRange) return;
        const range = this.selectionRange;
        const lines = this.quill.getLines(range.index, range.length || 1);
        if (lines.length > 0) {
            const startIndex = this.quill.getIndex(lines[0]);
            const lastBlot = lines[lines.length - 1];
            const endIndex = this.quill.getIndex(lastBlot) + lastBlot.length();
            this.quill.deleteText(startIndex, endIndex - startIndex, 'user');
            this.hideToolbar();
        }
    }

    private getDropPosition(e: DragEvent) {
        let dropIndex = -1;
        let targetRect: DOMRect | null = null;
        let isAfter = false;

        const range = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
        let targetNode = e.target as HTMLElement;
        
        if (range && range.startContainer) {
            targetNode = (range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer) as HTMLElement;
        }

        const block = this.findBlock(targetNode);
        if (block) {
            const dropBlot = Quill.find(block);
            if (dropBlot) {
                targetRect = block.getBoundingClientRect();
                dropIndex = this.quill.getIndex(dropBlot);
                
                const relativeY = e.clientY - targetRect.top;
                if (relativeY > targetRect.height / 2) {
                    // @ts-ignore
                    dropIndex += dropBlot.length();
                    isAfter = true;
                }
            }
        }

        if (dropIndex === -1) dropIndex = this.quill.getLength();

        return { dropIndex, targetRect, isAfter };
    }

    private handleDragOver(e: DragEvent) {
        if (!this.dragTarget || !this.dropIndicator) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

        const { dropIndex, targetRect, isAfter } = this.getDropPosition(e);

        if (dropIndex >= this.dragTarget.index && dropIndex <= this.dragTarget.index + this.dragTarget.length) {
            this.dropIndicator.style.display = 'none';
            return;
        }

        if (targetRect) {
            const containerRect = this.container.getBoundingClientRect();
            this.dropIndicator.style.display = 'block';
            this.dropIndicator.style.width = `${targetRect.width}px`;
            this.dropIndicator.style.left = `${targetRect.left - containerRect.left}px`;
            
            const top = isAfter ? targetRect.bottom : targetRect.top;
            this.dropIndicator.style.top = `${top - containerRect.top - 2}px`;
        } else {
            this.dropIndicator.style.display = 'none';
        }
    }

    private handleDragStart(e: DragEvent) {
        if (!this.selectionRange || this.currentBlocks.length === 0) return;

        const lines = this.quill.getLines(this.selectionRange.index, this.selectionRange.length || 1);
        const startIndex = this.quill.getIndex(lines[0]);
        const lastBlot = lines[lines.length - 1];
        const endIndex = this.quill.getIndex(lastBlot) + lastBlot.length();

        this.dragTarget = {
            index: startIndex,
            length: endIndex - startIndex
        };

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'quill-drag-element');
        }
        
        this.currentBlocks.forEach(b => b.classList.add('ql-node-mover-dragging'));
    }

    private handleDragEnd() {
        this.currentBlocks.forEach(b => b.classList.remove('ql-node-mover-dragging'));
        if (this.dropIndicator) this.dropIndicator.style.display = 'none';
        this.dragTarget = null;
        this.hideToolbar();
    }

    private handleDrop(e: DragEvent) {
        if (!this.dragTarget) return;
        e.preventDefault();
        if (this.dropIndicator) this.dropIndicator.style.display = 'none';

        const { dropIndex } = this.getDropPosition(e);

        if (dropIndex >= this.dragTarget.index && dropIndex <= this.dragTarget.index + this.dragTarget.length) {
            this.handleDragEnd();
            return;
        }

        const delta = this.quill.getContents(this.dragTarget.index, this.dragTarget.length);

        this.quill.updateContents(
            new Delta().retain(this.dragTarget.index).delete(this.dragTarget.length),
            'user'
        );

        const finalDropIndex = dropIndex > this.dragTarget.index ? dropIndex - this.dragTarget.length : dropIndex;

        this.quill.updateContents(
            new Delta().retain(finalDropIndex).concat(delta),
            'user'
        );

        this.quill.setSelection(finalDropIndex, this.dragTarget.length, 'silent');
        this.handleDragEnd();
    }
}
