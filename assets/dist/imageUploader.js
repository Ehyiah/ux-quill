import LoadingImage from "./blots/image.js";
const typedLoadingImage = LoadingImage;
class ImageUploader {
  quill;
  options;
  range;
  placeholderDelta;
  fileHolder;
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    // Initialisation avec un range par défaut
    this.range = {
      index: 0,
      length: 0
    };
    this.placeholderDelta = {
      ops: []
    };
    if (typeof this.options.upload !== 'function') console.warn('[Missing config] upload function that returns a promise is required');
    const toolbar = this.quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('image', this.selectLocalImage.bind(this));
    }
    this.handleDrop = this.handleDrop.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.quill.root.addEventListener('drop', this.handleDrop, true);
    this.quill.root.addEventListener('paste', this.handlePaste, true);
  }
  selectLocalImage() {
    this.quill.focus();
    const selection = this.quill.getSelection();
    if (selection) {
      this.range = selection;
    }
    this.fileHolder = document.createElement('input');
    this.fileHolder.setAttribute('type', 'file');
    this.fileHolder.setAttribute('accept', 'image/*');
    this.fileHolder.setAttribute('style', 'visibility:hidden');
    this.fileHolder.onchange = this.fileChanged.bind(this);
    document.body.appendChild(this.fileHolder);
    this.fileHolder.click();
    window.requestAnimationFrame(() => {
      document.body.removeChild(this.fileHolder);
    });
  }
  handleDrop(evt) {
    if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
      evt.stopPropagation();
      evt.preventDefault();
      if (document.caretRangeFromPoint) {
        const selection = document.getSelection();
        const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
        }
      } else {
        const selection = document.getSelection();
        const range = document.caretPositionFromPoint?.(evt.clientX, evt.clientY);
        if (selection && range) {
          selection.setBaseAndExtent(range.offsetNode, range.offset, range.offsetNode, range.offset);
        }
      }
      this.quill.focus();
      const selection = this.quill.getSelection();
      if (selection) {
        this.range = selection;
      }
      const file = evt.dataTransfer.files[0];
      setTimeout(() => {
        this.quill.focus();
        const newSelection = this.quill.getSelection();
        if (newSelection) {
          this.range = newSelection;
        }
        this.readAndUploadFile(file);
      }, 0);
    }
  }
  handlePaste(evt) {
    const clipboard = evt.clipboardData || window.clipboardData;

    // IE 11 is .files other browsers are .items
    if (clipboard && (clipboard.items || clipboard.files)) {
      const items = clipboard.items || clipboard.files;
      const IMAGE_MIME_REGEX = /^image\/(jpe?g|gif|png|svg|webp)$/i;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (IMAGE_MIME_REGEX.test(item.type)) {
          const file = 'getAsFile' in item ? item.getAsFile() : item;
          if (file) {
            this.quill.focus();
            const selection = this.quill.getSelection();
            if (selection) {
              this.range = selection;
            }
            evt.preventDefault();
            setTimeout(() => {
              this.quill.focus();
              const newSelection = this.quill.getSelection();
              if (newSelection) {
                this.range = newSelection;
              }
              this.readAndUploadFile(file);
            }, 0);
          }
        }
      }
    }
  }
  readAndUploadFile(file) {
    let isUploadReject = false;
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      if (!isUploadReject) {
        const base64ImageSrc = fileReader.result;
        this.insertBase64Image(base64ImageSrc);
      }
    }, false);
    if (file) {
      fileReader.readAsDataURL(file);
    }
    this.options.upload(file).then(imageUrl => {
      this.insertToEditor(imageUrl);
    }, error => {
      isUploadReject = true;
      this.removeBase64Image();
      console.warn(error);
    });
  }
  fileChanged() {
    let file = null;
    if (this.fileHolder.files && this.fileHolder.files.length > 0) {
      file = this.fileHolder.files[0];
    }
    if (file) {
      this.readAndUploadFile(file);
    }
  }
  insertBase64Image(url) {
    const range = this.range;

    // Utiliser directement 'imageBlot' comme nom de blot
    this.placeholderDelta = this.quill.insertEmbed(range.index, 'imageBlot', `${url}`, 'user');
  }
  insertToEditor(url) {
    const range = this.range;
    const lengthToDelete = this.calculatePlaceholderInsertLength();

    // S'assurer que le delta est valide avant de tenter la suppression
    if (lengthToDelete > 0) {
      // Delete the placeholder image
      this.quill.deleteText(range.index, lengthToDelete, 'user');
    }

    // Insert the server saved image
    this.quill.insertEmbed(range.index, 'image', `${url}`, 'user');

    // Réinitialiser le placeholderDelta pour éviter les suppressions multiples
    this.placeholderDelta = {
      ops: []
    };
    range.index++;
    this.quill.setSelection(range, 'user');
  }
  calculatePlaceholderInsertLength() {
    // Vérifier si placeholderDelta est défini et contient des opérations
    if (!this.placeholderDelta || !this.placeholderDelta.ops || !Array.isArray(this.placeholderDelta.ops)) {
      return 0;
    }
    return this.placeholderDelta.ops.reduce((accumulator, deltaOperation) => {
      // Vérifier si deltaOperation est défini
      if (deltaOperation && typeof deltaOperation === 'object') {
        const hasInsertProperty = Object.prototype.hasOwnProperty.call(deltaOperation, 'insert');
        if (hasInsertProperty) accumulator++;
      }
      return accumulator;
    }, 0);
  }
  removeBase64Image() {
    const range = this.range;
    const lengthToDelete = this.calculatePlaceholderInsertLength();
    if (lengthToDelete > 0) {
      this.quill.deleteText(range.index, lengthToDelete, 'user');
    }

    // Réinitialiser placeholderDelta pour éviter les suppressions multiples
    this.placeholderDelta = {
      ops: []
    };
  }
}
window.ImageUploader = ImageUploader;
export default ImageUploader;
//# sourceMappingURL=imageUploader.js.map