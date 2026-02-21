import Quill from 'quill';
import Delta from 'quill-delta';

export interface DragAndDropOptions {
    draggableSelector?: string;
    handleHTML?: string;
}

export default class DragAndDrop {
    private quill: Quill;
    private options: DragAndDropOptions;
    private handle: HTMLElement;
    private currentTarget: HTMLElement | null = null;
    private dragTarget: { blot: any, index: number } | null = null;

    constructor(quill: Quill, options: DragAndDropOptions = {}) {
        this.quill = quill;
        this.options = {
            draggableSelector: 'img, .ql-video, .ql-embed-wrapper',
            handleHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>',
            ...options
        };

        // Create the drag handle
        this.handle = document.createElement('div');
        this.handle.classList.add('ql-drag-handle');
        this.handle.innerHTML = this.options.handleHTML!;
        this.handle.setAttribute('draggable', 'true');

        // Style the handle
        Object.assign(this.handle.style, {
            position: 'absolute',
            display: 'none',
            cursor: 'move',
            width: '24px',
            height: '24px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: '1000',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333'
        });

        this.quill.container.appendChild(this.handle);

        // Listeners for showing/hiding handle
        this.quill.root.addEventListener('mouseover', this.handleMouseOver.bind(this));

        // Hide when leaving the editor or the handle
        this.quill.container.addEventListener('mouseleave', () => this.hideHandle());
        this.handle.addEventListener('mouseleave', (e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!this.currentTarget || (relatedTarget !== this.currentTarget && !this.currentTarget.contains(relatedTarget))) {
                this.hideHandle();
            }
        });

        // Native Drag events on the handle
        this.handle.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.handle.addEventListener('dragend', this.handleDragEnd.bind(this));

        // Drop events on the editor
        this.quill.root.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        });
        this.quill.root.addEventListener('drop', this.handleDrop.bind(this));

        // Hide handle on scroll or change
        this.quill.on('text-change', () => this.hideHandle());
        this.quill.root.addEventListener('scroll', () => this.hideHandle());
    }

    private handleMouseOver(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const isDraggable = target && target.nodeType === 1 && target.matches(this.options.draggableSelector!);
        const isHandle = target === this.handle || this.handle.contains(target);

        if (isDraggable) {
            this.showHandle(target);
        } else if (!isHandle) {
            this.hideHandle();
        }
    }

    private showHandle(target: HTMLElement): void {
        if (this.dragTarget) return;

        this.currentTarget = target;
        const rect = target.getBoundingClientRect();
        const containerRect = this.quill.container.getBoundingClientRect();

        this.handle.style.display = 'flex';
        this.handle.style.top = `${rect.top - containerRect.top + 5}px`;
        this.handle.style.left = `${rect.left - containerRect.left + 5}px`;
    }

    private hideHandle(): void {
        if (this.dragTarget) return;
        this.handle.style.display = 'none';
        this.currentTarget = null;
    }

    private handleDragStart(e: DragEvent): void {
        if (!this.currentTarget) return;

        const blot = Quill.find(this.currentTarget);
        if (blot) {
            this.dragTarget = {
                blot: blot,
                index: this.quill.getIndex(blot)
            };
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', 'quill-drag-element');
            }
            this.currentTarget.style.opacity = '0.5';
        }
    }

    private handleDragEnd(): void {
        // Reset opacity on all potential targets to be safe
        const elements = this.quill.root.querySelectorAll(this.options.draggableSelector!);
        elements.forEach(el => {
            if (el instanceof HTMLElement) {
                el.style.opacity = '';
            }
        });

        this.dragTarget = null;
        // Force immediate hide
        this.handle.style.display = 'none';
        this.currentTarget = null;
    }

    private handleDrop(e: DragEvent): void {
        if (!this.dragTarget) return;
        e.preventDefault();

        let dropIndex = this.quill.getLength();

        if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range) {
                const dropBlot = Quill.find(range.startContainer);
                if (dropBlot) {
                    dropIndex = this.quill.getIndex(dropBlot) + range.startOffset;
                }
            }
        }

        if (this.dragTarget.index === dropIndex || this.dragTarget.index === dropIndex - 1) {
            this.handleDragEnd();
            return;
        }

        const delta = this.quill.getContents(this.dragTarget.index, 1);

        this.quill.updateContents(
            new Delta().retain(this.dragTarget.index).delete(1),
            'user'
        );

        const finalDropIndex = dropIndex > this.dragTarget.index ? dropIndex - 1 : dropIndex;

        this.quill.updateContents(
            new Delta().retain(finalDropIndex).concat(delta),
            'user'
        );

        this.quill.setSelection(finalDropIndex, 0, 'silent');
        this.handleDragEnd();
    }
}
