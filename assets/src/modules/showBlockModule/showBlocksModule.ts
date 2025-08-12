import Quill from 'quill';

interface ShowBlocksOptions {
    enabled?: boolean;
    confirmDeletion?: boolean;
    toolbarIcon?: string;
}

type BlockElement = HTMLElement & { draggable?: boolean };

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'BLOCKQUOTE', 'LI', 'DIV'];

export default class ShowBlocks {
    private quill: Quill;
    private options: ShowBlocksOptions;
    private toolbarButton?: HTMLElement;
    private container: HTMLElement;
    private modal?: HTMLElement;

    constructor(quill: Quill, options: ShowBlocksOptions = {}) {
        this.quill = quill;
        this.options = {
            enabled: true,
            confirmDeletion: false,
            toolbarIcon: '¶',
            ...options,
        };

        this.container = this.quill.root;

        if (this.options.enabled) {
            this.enable();
        }

        this.addToolbarButton();
    }

    private enable() {
        this.renderLabels();
        this.attachDragAndDrop();
    }

    private disable() {
        this.clearLabels();
        this.detachDragAndDrop();
    }

    private addToolbarButton() {
        const toolbar = this.quill.getModule('toolbar') as any;
        if (!toolbar) return;

        this.toolbarButton = document.createElement('button');
        this.toolbarButton.type = 'button';
        this.toolbarButton.setAttribute('aria-label', 'Afficher les blocs');
        this.toolbarButton.innerHTML = this.options.toolbarIcon || '¶';
        this.toolbarButton.classList.add('ql-show-blocks-btn');
        this.toolbarButton.style.cursor = 'pointer';
        this.toolbarButton.style.fontSize = '16px';
        this.toolbarButton.style.userSelect = 'none';

        this.toolbarButton.addEventListener('click', () => {
            if (this.options.enabled) {
                this.disable();
                this.options.enabled = false;
                this.toolbarButton?.classList.remove('active');
            } else {
                this.enable();
                this.options.enabled = true;
                this.toolbarButton?.classList.add('active');
            }
        });

        toolbar.container.appendChild(this.toolbarButton);

        if (this.options.enabled) {
            this.toolbarButton.classList.add('active');
        }
    }

    private renderLabels() {
        // Parcourir tous les blocs dans l'éditeur
        const children = Array.from(this.container.children) as BlockElement[];
        children.forEach(block => {
            if (BLOCK_TAGS.includes(block.tagName)) {
                if (!block.querySelector('.ql-block-label')) {
                    const label = document.createElement('div');
                    label.className = 'ql-block-label';
                    label.textContent = block.tagName.toLowerCase();
                    block.style.position = 'relative';
                    label.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            background: #1976d2;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 0 5px;
            border-bottom-right-radius: 4px;
            user-select: none;
            pointer-events: none;
            z-index: 10;
          `;
                    block.prepend(label);
                    block.draggable = true;
                    block.style.cursor = 'move';

                    if (this.options.confirmDeletion) {
                        block.addEventListener('keydown', (evt) => {
                            if (evt.key === 'Delete' || evt.key === 'Backspace') {
                                evt.preventDefault();
                                this.confirmAndDeleteBlock(block);
                            }
                        });
                    }
                }
            }
        });
    }

    private clearLabels() {
        const children = Array.from(this.container.children) as BlockElement[];
        children.forEach(block => {
            const label = block.querySelector('.ql-block-label');
            if (label) {
                label.remove();
                block.draggable = false;
                block.style.cursor = '';
            }
        });
    }

    private attachDragAndDrop() {
        const blocks = Array.from(this.container.children) as BlockElement[];

        blocks.forEach(block => {
            if (BLOCK_TAGS.includes(block.tagName)) {
                block.addEventListener('dragstart', this.handleDragStart);
                block.addEventListener('dragover', this.handleDragOver);
                block.addEventListener('drop', this.handleDrop.bind(this));
                block.addEventListener('dragend', this.handleDragEnd);
            }
        });
    }

    private detachDragAndDrop() {
        const blocks = Array.from(this.container.children) as BlockElement[];
        blocks.forEach(block => {
            if (BLOCK_TAGS.includes(block.tagName)) {
                block.removeEventListener('dragstart', this.handleDragStart);
                block.removeEventListener('dragover', this.handleDragOver);
                block.removeEventListener('drop', this.handleDrop.bind(this));
                block.removeEventListener('dragend', this.handleDragEnd);
            }
        });
    }

    private draggedElement: BlockElement | null = null;

    private handleDragStart = (evt: DragEvent) => {
        this.draggedElement = evt.currentTarget as BlockElement;
        evt.dataTransfer?.setData('text/plain', '');
        evt.dataTransfer!.effectAllowed = 'move';
        // ajouter un style lors du drag
        this.draggedElement.style.opacity = '0.4';
    };

    private handleDragOver = (evt: DragEvent) => {
        evt.preventDefault();
        evt.dataTransfer!.dropEffect = 'move';
    };

    private handleDrop(evt: DragEvent) {
        evt.preventDefault();
        if (!this.draggedElement) return;
        const target = evt.currentTarget as BlockElement;
        if (target === this.draggedElement) return;

        // Réordonnancer les blocs dans le DOM
        const parent = this.container;
        // insérer avant ou après selon la position de la souris
        const mouseY = evt.clientY;
        const targetRect = target.getBoundingClientRect();
        if (mouseY < targetRect.top + targetRect.height / 2) {
            parent.insertBefore(this.draggedElement, target);
        } else {
            parent.insertBefore(this.draggedElement, target.nextSibling);
        }

        this.draggedElement.style.opacity = '1';
        this.draggedElement = null;
    }

    private handleDragEnd = (evt: DragEvent) => {
        if (this.draggedElement) {
            this.draggedElement.style.opacity = '1';
            this.draggedElement = null;
        }
    };

    private confirmAndDeleteBlock(block: BlockElement) {
        if (!this.modal) {
            this.createModal();
        }
        this.showModal(() => {
            block.remove();
            this.hideModal();
        });
    }

    private createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'ql-show-blocks-modal';
        this.modal.innerHTML = `
      <div class="modal-content">
        <p>Voulez-vous vraiment supprimer ce bloc ?</p>
        <div class="modal-actions">
          <button class="btn-cancel">Annuler</button>
          <button class="btn-confirm">Supprimer</button>
        </div>
      </div>
    `;
        document.body.appendChild(this.modal);

        this.modal.querySelector('.btn-cancel')?.addEventListener('click', () => this.hideModal());
    }

    private showModal(onConfirm: () => void) {
        if (!this.modal) return;
        this.modal.style.display = 'flex';

        const btnConfirm = this.modal.querySelector('.btn-confirm');
        if (!btnConfirm) return;

        const confirmHandler = () => {
            onConfirm();
            btnConfirm.removeEventListener('click', confirmHandler);
        };
        btnConfirm.addEventListener('click', confirmHandler);
    }

    private hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}
