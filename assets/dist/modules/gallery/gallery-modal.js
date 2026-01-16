import { uploadStrategies, handleUploadResponse } from "./../../upload-utils.js";
export default class GalleryModal {
  module;
  container;
  nextUrl;
  prevUrl;
  images;
  constructor(module) {
    this.module = module;
    this.container = null;
    this.images = [];
    this.nextUrl = null;
    this.prevUrl = null;
  }
  async open() {
    this.renderModal();
    await this.loadImages();
  }
  close() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
  renderModal() {
    this.container = document.createElement('div');
    this.container.classList.add('quill-media-modal');
    this.container.innerHTML = `
      <div class="quill-media-window">
        <div class="quill-media-header">
          <h3>Galerie de médias</h3>
          <button class="close-btn" title="Fermer la galerie" aria-label="Fermer">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="quill-media-grid" id="media-grid">
          <p style="text-align:center;width:100%">${this.module.options.messageLoadingOption}</p>
        </div>
        <div class="quill-media-footer">
          <button class="prev-btn" disabled>${this.module.options.messagePrevPageOption}</button>
          <label class="upload-btn">
            <input type="file" style="display:none" />
              ${this.module.options.uploadTitle}
          </label>
          <button class="next-btn" disabled>${this.module.options.messageNextPageOption}</button>
        </div>
      </div>
    `;
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
    const fileInput = this.container.querySelector('.upload-btn input[type="file"]');
    fileInput.addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      fileInput.disabled = true;
      try {
        const response = await uploadStrategies['form'](this.module.options.uploadEndpoint, file, this.module.options.authConfig);
        await handleUploadResponse(response, this.module.options.jsonResponseFilePath);
        await this.loadImages();
      } catch (e) {
        console.error('Error upload :', e);
        alert('Upload error');
      } finally {
        fileInput.disabled = false;
        fileInput.value = '';
      }
    });
    this.injectCss();
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
    grid.innerHTML = `<p style="text-align:center;width:100%">${this.module.options.messageLoadingOption}</p>`;
    try {
      const data = await this.module.list(url);
      this.images = data.data || [];
      this.nextUrl = data.links?.next || null;
      this.prevUrl = data.links?.prev || null;
      this.renderGrid();
      this.updatePaginationButtons();
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<p style="color:red;text-align:center;">${this.module.options.messageErrorOption}</p>`;
    }
  }
  renderGrid() {
    const grid = this.container.querySelector('#media-grid');
    grid.innerHTML = '';
    if (this.images.length === 0) {
      grid.innerHTML = `<p style="text-align:center;width:100%">${this.module.options.messageNoImageOption}</p>`;
      return;
    }
    this.images.forEach(img => {
      const image = document.createElement('img');
      image.src = img.thumbnail || img.url;
      image.alt = img.title || '';
      image.classList.add('quill-media-item', 'fade-in');
      image.addEventListener('click', () => {
        this.module.insertImage(img.url);
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
  injectCss() {
    if (document.getElementById('quill-gallery-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'quill-gallery-modal-styles';
    style.textContent = `
      /* Fade-in images */
      .quill-media-item.fade-in {
        opacity: 0;
        animation: fadeInImage 0.4s ease forwards;
      }
      @keyframes fadeInImage {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Close button */
      .quill-media-header .close-btn {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #555;
        transition: all 0.2s ease;
      }
      .quill-media-header .close-btn:hover {
        background: #eee;
        color: #000;
        transform: rotate(90deg);
      }
      .quill-media-header .close-btn svg {
        pointer-events: none;
      }

      /* Footer layout */
      .quill-media-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: #f7f7f9;
        border-top: 1px solid #e0e0e0;
      }

      /* Upload button */
      .upload-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0d6efd;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s ease, transform 0.2s ease;
      }
      .upload-btn:hover {
        background: #0b5ed7;
        transform: scale(1.05);
      }
      .upload-btn input[type="file"] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }
}
//# sourceMappingURL=gallery-modal.js.map