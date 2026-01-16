import GalleryModal from "./gallery-modal.js";
export default class GalleryModule {
  quill;
  options;
  modal;
  constructor(quill, options) {
    this.quill = quill;
    this.options = {
      uploadEndpoint: options.uploadEndpoint || '',
      listEndpoint: options.listEndpoint || '',
      icon: options.icon,
      buttonTitle: options.buttonTitle || '',
      uploadTitle: options.uploadTitle || '',
      messageLoadingOption: options.messageLoadingOption || '',
      messageNextPageOption: options.messageNextPageOption || '',
      messagePrevPageOption: options.messagePrevPageOption || '',
      messageErrorOption: options.messageErrorOption || '',
      messageNoImageOption: options.messageNoImageOption || ''
    };
    this.injectCss();
    this.modal = new GalleryModal(this);
    this.addToolbarButton();
  }
  addToolbarButton() {
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar || !toolbar.container) return;
    if (toolbar.container.querySelector('.ql-gallery')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('ql-gallery');
    button.innerHTML = this.options.icon;
    button.title = this.options.buttonTitle;
    button.addEventListener('click', () => this.open());
    const group = toolbar.container.querySelector('.ql-formats:last-child');
    if (group) group.appendChild(button);else toolbar.container.appendChild(button);
  }
  open() {
    this.modal.open();
  }
  insertImage(url) {
    const range = this.quill.getSelection(true);
    if (range) {
      this.quill.insertEmbed(range.index, 'image', url, 'user');
      this.quill.setSelection(range.index + 1);
    }
  }
  async list(url) {
    if (url === void 0) {
      url = null;
    }
    const endpoint = url || this.options.listEndpoint;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Erreur while loading : ${response.statusText}`);
    return response.json();
  }
  injectCss() {
    if (document.getElementById('quill-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'quill-gallery-styles';
    style.textContent = `
      .quill-media-modal {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 9999;
        animation: fadeIn 0.2s ease-in-out;
      }

      .quill-media-window {
        background: #fff;
        border-radius: 12px;
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        animation: popIn 0.25s ease-out;
      }

      .quill-media-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f7f7f9;
        border-bottom: 1px solid #e0e0e0;
      }

      .quill-media-header h3 {
        font-size: 1.1rem;
        margin: 0;
        font-weight: 600;
        color: #333;
      }

      .quill-media-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
      }

      .quill-media-item {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .quill-media-item:hover {
        transform: scale(1.04);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        border: 2px solid #0d6efd;
      }

      .quill-media-footer {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: #f7f7f9;
        border-top: 1px solid #e0e0e0;
      }

      .quill-media-footer button {
        background: #0d6efd;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s ease;
      }

      .quill-media-footer button:hover:not(:disabled) {
        background: #0b5ed7;
      }

      .quill-media-footer button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes popIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
//# sourceMappingURL=gallery-module.js.map