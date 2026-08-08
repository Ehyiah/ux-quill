import { uploadStrategies, handleUploadResponse } from "./../../upload-utils.js";
export default class GalleryModal {
  constructor(module) {
    this.module = void 0;
    this.container = void 0;
    this.nextUrl = void 0;
    this.prevUrl = void 0;
    this.images = void 0;
    this.module = module;
    this.container = null;
    this.images = [];
    this.nextUrl = null;
    this.prevUrl = null;
  }
  async open() {
    this.renderModal();
    this.dispatch('gallery:open', {
      modal: this.container
    });
    await this.loadImages();
  }
  close() {
    if (this.container) {
      this.dispatch('gallery:close', {
        modal: this.container
      });
      this.container.remove();
      this.container = null;
    }
  }
  renderModal() {
    this.container = document.createElement('div');
    this.container.classList.add('quill-media-modal');
    const uploadButtonHtml = this.module.options.uploadEndpoint ? "<label class=\"upload-btn\">\n                <input type=\"file\" style=\"display:none\" />\n                " + this.module.options.uploadTitle + "\n               </label>" : '';
    const searchInputHtml = this.module.options.searchEndpoint ? "<div class=\"quill-media-search\">\n                 <input type=\"text\" class=\"search-input\" placeholder=\"" + this.module.options.messageSearchPlaceholderOption + "\" />\n               </div>" : '';
    this.container.innerHTML = "\n      <div class=\"quill-media-window\">\n        <div class=\"quill-media-header\">\n          <h3>" + this.module.options.messageTitleOption + "</h3>\n          <button class=\"close-btn\" title=\"" + this.module.options.messageCloseOption + "\" aria-label=\"" + this.module.options.messageCloseOption + "\">\n            <svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n              <line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line>\n              <line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line>\n            </svg>\n          </button>\n        </div>\n        " + searchInputHtml + "\n        <div class=\"quill-media-grid\" id=\"media-grid\">\n          <p style=\"text-align:center;width:100%\">" + this.module.options.messageLoadingOption + "</p>\n        </div>\n        <div class=\"quill-media-footer\">\n          <button class=\"prev-btn\" disabled>" + this.module.options.messagePrevPageOption + "</button>\n          " + uploadButtonHtml + "\n          <button class=\"next-btn\" disabled>" + this.module.options.messageNextPageOption + "</button>\n        </div>\n      </div>\n    ";
    document.body.appendChild(this.container);
    this.container.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.container.addEventListener('click', e => {
      if (e.target === this.container) this.close();
    });
    this.container.querySelector('.prev-btn').addEventListener('click', () => {
      if (this.prevUrl) this.loadImages(this.prevUrl);
    });
    this.container.querySelector('.next-btn').addEventListener('click', () => {
      if (this.nextUrl) this.loadImages(this.nextUrl);
    });
    if (this.module.options.searchEndpoint) {
      const searchInput = this.container.querySelector('.search-input');
      let timeout = null;
      searchInput.addEventListener('input', e => {
        const target = e.target;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (target.value.trim() === '') {
            this.loadImages();
          } else {
            this.searchImages(target.value);
          }
        }, 300);
      });
    }
    if (this.module.options.uploadEndpoint) {
      const fileInput = this.container.querySelector('.upload-btn input[type="file"]');
      fileInput.addEventListener('change', async event => {
        const file = event.target.files[0];
        if (!file) return;
        fileInput.disabled = true;
        try {
          const strategy = this.module.options.uploadStrategy || 'form';
          const response = await uploadStrategies[strategy](this.module.options.uploadEndpoint, file, this.module.options.authConfig);
          const res = await handleUploadResponse(response, this.module.options.jsonResponseFilePath);
          this.dispatch('gallery:upload-success', {
            response: res,
            file
          });
          await this.loadImages();
        } catch (e) {
          console.error('Error upload :', e);
          alert('Upload error');
        } finally {
          fileInput.disabled = false;
          fileInput.value = '';
        }
      });
    }
  }
  async loadImages(url) {
    if (url === void 0) {
      url = null;
    }
    if (!this.container) {
      return;
    }
    const grid = this.container.querySelector('#media-grid');
    if (!grid) {
      return;
    }
    grid.innerHTML = "<p style=\"text-align:center;width:100%\">" + this.module.options.messageLoadingOption + "</p>";
    try {
      var _data$links, _data$links2;
      const data = await this.module.list(url);
      this.images = data.data || [];
      this.nextUrl = ((_data$links = data.links) == null ? void 0 : _data$links.next) || null;
      this.prevUrl = ((_data$links2 = data.links) == null ? void 0 : _data$links2.prev) || null;
      this.renderGrid();
      this.updatePaginationButtons();
    } catch (e) {
      console.error(e);
      grid.innerHTML = "<p style=\"color:red;text-align:center;\">" + this.module.options.messageErrorOption + "</p>";
    }
  }
  async searchImages(query) {
    if (!this.container) return;
    const grid = this.container.querySelector('#media-grid');
    if (!grid) return;
    grid.innerHTML = "<p style=\"text-align:center;width:100%\">" + this.module.options.messageLoadingOption + "</p>";
    try {
      var _data$links3, _data$links4;
      const data = await this.module.search(query);
      this.images = data.data || [];
      this.nextUrl = ((_data$links3 = data.links) == null ? void 0 : _data$links3.next) || null;
      this.prevUrl = ((_data$links4 = data.links) == null ? void 0 : _data$links4.prev) || null;
      this.renderGrid();
      this.updatePaginationButtons();
    } catch (e) {
      console.error(e);
      grid.innerHTML = "<p style=\"color:red;text-align:center;\">" + this.module.options.messageErrorOption + "</p>";
    }
  }
  renderGrid() {
    const grid = this.container.querySelector('#media-grid');
    grid.innerHTML = '';
    if (this.images.length === 0) {
      grid.innerHTML = "<p style=\"text-align:center;width:100%\">" + this.module.options.messageNoImageOption + "</p>";
      return;
    }
    this.images.forEach(img => {
      const image = document.createElement('img');
      image.src = img.thumbnail || img.url;
      image.alt = img.title || '';
      image.classList.add('quill-media-item', 'fade-in');
      image.addEventListener('click', () => {
        this.module.insertImage(img.url);
        this.dispatch('gallery:image-inserted', {
          image: img
        });
        this.close();
      });
      grid.appendChild(image);
    });
  }
  updatePaginationButtons() {
    const prev = this.container.querySelector('.prev-btn');
    const next = this.container.querySelector('.next-btn');
    prev.disabled = !this.prevUrl;
    next.disabled = !this.nextUrl;
  }
  dispatch(name, detail) {
    this.module.quill.container.dispatchEvent(new CustomEvent("quill:" + name, {
      bubbles: true,
      cancelable: true,
      detail: detail
    }));
  }
}