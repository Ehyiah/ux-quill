const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'BLOCKQUOTE', 'LI', 'DIV'];
function injectStyles() {
  const styleId = 'ql-show-blocks-styles';
  if (document.getElementById(styleId)) {
    return;
  }
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
        .ql-block-label {
            user-select: none;
            pointer-events: none;
        }

        /* Contours des blocs avec bordure plus épaisse */
        .ql-show-block {
            border: 4px dashed #1976d2 !important;
            padding: 25px 10px 10px 35px !important;
            margin: 8px 0 !important;
            position: relative !important;
            min-height: 40px !important;
            cursor: grab !important;
        }

        .ql-show-block:hover {
            border-color: #0d47a1 !important;
            background-color: rgba(25, 118, 210, 0.05) !important;
        }

        .ql-show-block:active {
            cursor: grabbing !important;
        }

        .ql-show-block.dragging {
            opacity: 0.4 !important;
            border-style: solid !important;
        }

        .ql-show-block.drag-over {
            background-color: rgba(25, 118, 210, 0.2) !important;
            border-color: #0d47a1 !important;
            border-style: solid !important;
        }

        /* Poignée de drag */
        .ql-drag-handle {
            position: absolute;
            left: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 40px;
            background: #1976d2;
            border-radius: 4px;
            cursor: grab !important;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            user-select: none;
            z-index: 100;
            transition: background-color 0.2s ease;
        }

        .ql-drag-handle:hover {
            background-color: #0d47a1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .ql-drag-handle:active {
            cursor: grabbing !important;
        }

        .ql-drag-handle::before {
            content: '⋮⋮';
            letter-spacing: -2px;
            font-size: 14px;
        }

        .ql-drag-handle.dragging {
            background-color: #0d47a1;
        }

        .ql-drag-placeholder {
            border: 4px dashed #ff9800 !important;
            background-color: rgba(255, 152, 0, 0.1) !important;
            min-height: 40px;
            margin: 8px 0;
        }

        .ql-show-blocks-btn.active {
            background-color: #1976d2 !important;
            color: white !important;
            border-radius: 4px;
        }

        /* Modal stylisée */
        .ql-show-blocks-modal {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0,0,0,0.5);
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }

        .ql-show-blocks-modal .modal-content {
            background: white;
            border-radius: 8px;
            padding: 20px;
            max-width: 320px;
            text-align: center;
            box-shadow: 0 6px 18px rgba(0,0,0,0.2);
        }

        .ql-show-blocks-modal .modal-actions {
            margin-top: 20px;
            display: flex;
            justify-content: space-around;
        }

        .ql-show-blocks-modal button {
            padding: 6px 14px;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s ease;
        }

        .ql-show-blocks-modal button.btn-cancel {
            background-color: #eee;
            color: #333;
        }

        .ql-show-blocks-modal button.btn-cancel:hover {
            background-color: #ddd;
        }

        .ql-show-blocks-modal button.btn-confirm {
            background-color: #d32f2f;
            color: white;
        }

        .ql-show-blocks-modal button.btn-confirm:hover {
            background-color: #b71c1c;
        }
    `;
  document.head.appendChild(style);
}
export default class ShowBlocks {
  quill;
  options;
  toolbarButton;
  container;
  modal;
  draggedElement = null;
  boundHandleDragOver;
  boundHandleDragLeave;
  boundHandleDrop;
  wasReadOnly = false;
  constructor(quill, options) {
    if (options === void 0) {
      options = {};
    }
    this.quill = quill;
    this.options = {
      confirmDeletion: false,
      toolbarIcon: '¶',
      ...options,
      // Forcer enabled à false au démarrage, peu importe les options passées
      enabled: false
    };
    this.container = this.quill.root;

    // Créer les handlers liés une seule fois
    this.boundHandleDragOver = this.handleDragOver.bind(this);
    this.boundHandleDragLeave = this.handleDragLeave.bind(this);
    this.boundHandleDrop = this.handleDrop.bind(this);

    // Injecter les styles CSS
    injectStyles();

    // Attendre que la toolbar soit prête
    setTimeout(() => {
      this.addToolbarButton();
    }, 100);

    // Écouter les changements dans l'éditeur pour mettre à jour les labels
    this.quill.on('text-change', () => {
      if (this.options.enabled) {
        setTimeout(() => this.renderLabels(), 0);
      }
    });
  }
  enable() {
    console.log('ShowBlocks: Enabling - rendering labels');
    // Ajouter un indicateur visuel
    this.container.style.userSelect = 'none';
    this.container.setAttribute('data-reorganization-mode', 'true');
    this.renderLabels();
    this.attachDragAndDrop();
  }
  disable() {
    console.log('ShowBlocks: Disabling - clearing labels');
    // Retirer l'indicateur visuel
    this.container.style.userSelect = '';
    this.container.removeAttribute('data-reorganization-mode');
    this.clearLabels();
    this.detachDragAndDrop();
  }
  addToolbarButton() {
    // Essayer plusieurs stratégies pour trouver la toolbar
    const editorContainer = this.quill.container;
    let toolbarElement = null;

    // Stratégie 1: previousElementSibling
    if (editorContainer.previousElementSibling?.classList.contains('ql-toolbar')) {
      toolbarElement = editorContainer.previousElementSibling;
    }

    // Stratégie 2: chercher dans le parent
    if (!toolbarElement && editorContainer.parentElement) {
      toolbarElement = editorContainer.parentElement.querySelector('.ql-toolbar');
    }

    // Stratégie 3: module toolbar
    if (!toolbarElement) {
      const toolbar = this.quill.getModule('toolbar');
      if (toolbar && toolbar.container) {
        toolbarElement = toolbar.container;
      }
    }
    if (!toolbarElement) {
      console.warn('ShowBlocks: Toolbar not found');
      return;
    }
    this.toolbarButton = document.createElement('button');
    this.toolbarButton.type = 'button';
    this.toolbarButton.className = 'ql-show-blocks-btn';
    this.toolbarButton.setAttribute('aria-label', 'Afficher les blocs');
    this.toolbarButton.innerHTML = this.options.toolbarIcon || '¶';
    this.toolbarButton.style.cssText = `
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            user-select: none;
            padding: 3px 5px;
            margin: 0 2px;
            border: 1px solid transparent;
        `;
    this.toolbarButton.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      console.log('ShowBlocks button clicked, current state:', this.options.enabled);
      if (this.options.enabled) {
        console.log('Disabling ShowBlocks');
        this.disable();
        this.options.enabled = false;
        this.toolbarButton?.classList.remove('active');
      } else {
        console.log('Enabling ShowBlocks');
        this.enable();
        this.options.enabled = true;
        this.toolbarButton?.classList.add('active');
      }
    });
    toolbarElement.appendChild(this.toolbarButton);
    console.log('ShowBlocks: Button added to toolbar');
  }
  renderLabels() {
    // Parcourir tous les blocs dans l'éditeur
    const children = Array.from(this.container.children);
    children.forEach(block => {
      if (BLOCK_TAGS.includes(block.tagName)) {
        // Ajouter la classe pour afficher le contour
        block.classList.add('ql-show-block');

        // Ajouter le label et la poignée seulement s'ils n'existent pas déjà
        if (!block.querySelector('.ql-block-label')) {
          const label = document.createElement('div');
          label.className = 'ql-block-label';
          label.textContent = block.tagName.toLowerCase();
          label.style.cssText = `
            position: absolute;
            top: 4px;
            left: 30px;
            background: #1976d2;
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 3px;
            user-select: none;
            pointer-events: none;
            z-index: 10;
          `;
          block.prepend(label);

          // Créer la poignée de drag
          const dragHandle = document.createElement('div');
          dragHandle.className = 'ql-drag-handle';
          dragHandle.draggable = true;
          dragHandle.title = 'Glisser pour déplacer le bloc';

          // Stocker une référence au bloc parent sur la poignée
          dragHandle.parentBlock = block;
          block.prepend(dragHandle);
          if (this.options.confirmDeletion) {
            block.addEventListener('keydown', evt => {
              if (evt.key === 'Delete' || evt.key === 'Backspace') {
                evt.preventDefault();
                this.confirmAndDeleteBlock(block);
              }
            });
          }

          // Attacher les événements drag & drop à la poignée
          this.attachDragAndDropToHandle(dragHandle);
        }

        // Attacher les événements drop au bloc lui-même
        if (!block.hasAttribute('data-drop-enabled')) {
          block.addEventListener('dragover', this.boundHandleDragOver);
          block.addEventListener('dragleave', this.boundHandleDragLeave);
          block.addEventListener('drop', this.boundHandleDrop);
          block.setAttribute('data-drop-enabled', 'true');
          console.log('Drop handlers attached to block:', block.tagName);
        }
      }
    });
  }
  clearLabels() {
    const children = Array.from(this.container.children);
    children.forEach(block => {
      // Supprimer le label s'il existe
      const label = block.querySelector('.ql-block-label');
      if (label) {
        label.remove();
      }

      // Supprimer la poignée de drag s'il existe
      const handle = block.querySelector('.ql-drag-handle');
      if (handle) {
        handle.remove();
      }

      // Toujours supprimer la classe et réinitialiser les propriétés pour TOUS les blocs
      if (BLOCK_TAGS.includes(block.tagName)) {
        block.classList.remove('ql-show-block');
        block.removeAttribute('data-drop-enabled');
        block.draggable = false;
        block.style.cursor = '';
      }
    });
  }
  attachDragAndDropToHandle(handle) {
    handle.addEventListener('dragstart', this.handleDragStart);
    handle.addEventListener('dragend', this.handleDragEnd);
  }
  attachDragAndDrop() {
    const blocks = Array.from(this.container.children);
    console.log('Attaching drag and drop to', blocks.length, 'blocks');
    blocks.forEach(block => {
      if (BLOCK_TAGS.includes(block.tagName)) {
        const handle = block.querySelector('.ql-drag-handle');
        if (handle) {
          this.attachDragAndDropToHandle(handle);
          console.log('Handle attached to:', block.tagName);
        }

        // Attacher les événements drop au bloc
        if (!block.hasAttribute('data-drop-enabled')) {
          block.addEventListener('dragover', this.boundHandleDragOver);
          block.addEventListener('dragleave', this.boundHandleDragLeave);
          block.addEventListener('drop', this.boundHandleDrop);
          block.setAttribute('data-drop-enabled', 'true');
        }
      }
    });
  }
  detachDragAndDrop() {
    const blocks = Array.from(this.container.children);
    blocks.forEach(block => {
      if (BLOCK_TAGS.includes(block.tagName)) {
        const handle = block.querySelector('.ql-drag-handle');
        if (handle) {
          handle.removeEventListener('dragstart', this.handleDragStart);
          handle.removeEventListener('dragend', this.handleDragEnd);
        }
        block.removeEventListener('dragover', this.boundHandleDragOver);
        block.removeEventListener('dragleave', this.boundHandleDragLeave);
        block.removeEventListener('drop', this.boundHandleDrop);
        block.removeAttribute('data-drop-enabled');
      }
    });
  }
  handleDragStart = evt => {
    console.log('=== DRAG START EVENT ===');
    const handle = evt.currentTarget;
    console.log('Handle element:', handle);

    // Récupérer le bloc parent depuis la poignée
    this.draggedElement = handle.parentBlock;
    console.log('Parent block found:', this.draggedElement);
    if (!this.draggedElement) {
      console.error('Could not find parent block for drag handle');
      return;
    }
    if (!evt.dataTransfer) {
      console.error('No dataTransfer available');
      return;
    }
    evt.dataTransfer.setData('text/plain', 'block-drag');
    evt.dataTransfer.effectAllowed = 'move';

    // Ajouter une classe pour le feedback visuel
    this.draggedElement.classList.add('dragging');
    handle.classList.add('dragging');
    console.log('Drag started successfully for:', this.draggedElement.tagName);
  };
  handleDragOver = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (!evt.dataTransfer) {
      console.warn('No dataTransfer in dragover');
      return;
    }
    evt.dataTransfer.dropEffect = 'move';
    const target = evt.currentTarget;
    if (target !== this.draggedElement) {
      target.classList.add('drag-over');
    }
  };
  handleDragLeave = evt => {
    const target = evt.currentTarget;
    target.classList.remove('drag-over');
  };
  handleDrop(evt) {
    console.log('=== DROP EVENT ===');
    evt.preventDefault();
    evt.stopPropagation();
    const target = evt.currentTarget;
    console.log('Drop target:', target.tagName);
    target.classList.remove('drag-over');
    if (!this.draggedElement) {
      console.warn('No dragged element');
      return;
    }
    if (target === this.draggedElement) {
      console.log('Dropped on self, ignoring');
      return;
    }
    console.log('Dropping block:', this.draggedElement.tagName, 'onto', target.tagName);

    // Réordonnancer les blocs dans le DOM
    const parent = this.container;
    const mouseY = evt.clientY;
    const targetRect = target.getBoundingClientRect();
    const middleY = targetRect.top + targetRect.height / 2;
    console.log('Mouse Y:', mouseY, 'Middle Y:', middleY);

    // Insérer avant ou après selon la position de la souris
    if (mouseY < middleY) {
      console.log('Inserting before target');
      parent.insertBefore(this.draggedElement, target);
    } else {
      console.log('Inserting after target');
      parent.insertBefore(this.draggedElement, target.nextSibling);
    }

    // Nettoyer les classes
    this.draggedElement.classList.remove('dragging');

    // Nettoyer les poignées
    const handle = this.draggedElement.querySelector('.ql-drag-handle');
    if (handle) {
      handle.classList.remove('dragging');
    }

    // Notifier Quill du changement pour synchroniser le contenu
    this.quill.update('user');
    console.log('Block moved successfully');
  }
  handleDragEnd = evt => {
    const handle = evt.currentTarget;
    handle.classList.remove('dragging');
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }

    // Nettoyer toutes les classes drag-over restantes
    const blocks = Array.from(this.container.children);
    blocks.forEach(block => {
      block.classList.remove('drag-over');
    });
  };
  confirmAndDeleteBlock(block) {
    if (!this.modal) {
      this.createModal();
    }
    this.showModal(() => {
      block.remove();
      this.hideModal();
    });
  }
  createModal() {
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
  showModal(onConfirm) {
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
  hideModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}