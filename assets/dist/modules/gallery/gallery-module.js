import GalleryModal from "./gallery-modal.js";
import "../../styles/gallery/gallery.css";
export default class ImageGalleryModule {
  constructor(quill, options) {
    this.quill = void 0;
    this.options = void 0;
    this.modal = void 0;
    this.quill = quill;
    this.options = {
      uploadEndpoint: options.uploadEndpoint || '',
      listEndpoint: options.listEndpoint || '',
      searchEndpoint: options.searchEndpoint || '',
      icon: options.icon || '',
      buttonTitle: options.buttonTitle || '',
      uploadTitle: options.uploadTitle || '',
      messageLoadingOption: options.messageLoadingOption || '',
      messageNextPageOption: options.messageNextPageOption || '',
      messagePrevPageOption: options.messagePrevPageOption || '',
      messageErrorOption: options.messageErrorOption || '',
      messageNoImageOption: options.messageNoImageOption || '',
      messageSearchPlaceholderOption: options.messageSearchPlaceholderOption || '',
      messageTitleOption: options.messageTitleOption || '',
      messageCloseOption: options.messageCloseOption || '',
      authConfig: options.authConfig,
      jsonResponseFilePath: options.jsonResponseFilePath,
      uploadStrategy: options.uploadStrategy || 'form'
    };
    if (!this.options.listEndpoint) {
      throw new Error('listEndpoint option is mandatory for ImageGalleryModule');
    }
    this.modal = new GalleryModal(this);
    this.addToolbarButton();
  }
  addToolbarButton() {
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar || !toolbar.container) return;
    const button = toolbar.container.querySelector('button.ql-imageGallery');
    if (button) {
      if (this.options.icon != null && button.innerHTML === '') {
        button.innerHTML = this.options.icon;
      }
      if (this.options.buttonTitle != null) {
        button.title = this.options.buttonTitle;
      }
      button.addEventListener('click', () => this.open());
    }
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
    if (!response.ok) throw new Error("Error while loading : " + response.statusText);
    return response.json();
  }
  async search(query) {
    if (!this.options.searchEndpoint) return this.list();
    const url = new URL(this.options.searchEndpoint, window.location.origin);
    url.searchParams.append('term', query);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Error while searching : " + response.statusText);
    return response.json();
  }
}