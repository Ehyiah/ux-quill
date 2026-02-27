import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class ImageFigure extends BlockEmbed {
  static blotName = 'image';
  static tagName = 'figure';
  static className = 'ql-image-figure';
  static create(value) {
    const node = super.create();
    const img = document.createElement('img');
    const src = typeof value === 'string' ? value : value.src;
    img.setAttribute('src', src);
    const figcaption = document.createElement('figcaption');
    if (typeof value === 'object') {
      if (value.alt) img.setAttribute('alt', value.alt);
      if (value.style) {
        node.setAttribute('style', value.style);
      }
      if (value.imgStyle) {
        img.setAttribute('style', value.imgStyle);
      } else {
        if (value.height) img.style.height = value.height;
        if (value.width) {
          if (!node.style.width) node.style.width = value.width;
          img.style.width = '100%';
        }
      }
      if (value.caption && value.caption.trim()) {
        const cleanCaption = value.caption.trim();
        img.setAttribute('data-caption', cleanCaption);
        figcaption.textContent = cleanCaption;
        figcaption.style.display = 'block';
      } else {
        img.removeAttribute('data-caption');
        figcaption.textContent = '';
        figcaption.style.display = 'none';
      }
    } else {
      figcaption.style.display = 'none';
    }
    node.appendChild(img);
    node.appendChild(figcaption);
    return node;
  }
  static value(node) {
    const img = node.querySelector('img');
    const figcaption = node.querySelector('figcaption');
    let caption = img?.getAttribute('data-caption') || figcaption?.textContent?.trim() || null;
    if (figcaption && figcaption.style.display === 'none') {
      caption = null;
    }
    return {
      src: img?.getAttribute('src'),
      alt: img?.getAttribute('alt'),
      width: node.style.width || img?.style.width || null,
      height: img?.style.height,
      style: node.getAttribute('style'),
      imgStyle: img?.getAttribute('style') || null,
      caption: caption
    };
  }
  static formats(node) {
    const img = node.querySelector('img');
    if (!img) return {};
    const figcaption = node.querySelector('figcaption');
    let caption = img.getAttribute('data-caption') || figcaption?.textContent?.trim() || null;
    if (figcaption && figcaption.style.display === 'none') {
      caption = null;
    }
    return {
      alt: img.getAttribute('alt'),
      width: node.style.width || img.style.width || null,
      height: img.style.height,
      style: node.getAttribute('style'),
      imgStyle: img.getAttribute('style') || null,
      caption: caption
    };
  }
  format(name, value) {
    const img = this.domNode.querySelector('img');
    const figcaption = this.domNode.querySelector('figcaption');
    if (!img || !figcaption) return;
    if (name === 'caption') {
      if (value && value.trim()) {
        const cleanCaption = value.trim();
        img.setAttribute('data-caption', cleanCaption);
        figcaption.textContent = cleanCaption;
        figcaption.style.display = 'block';
      } else {
        img.removeAttribute('data-caption');
        figcaption.textContent = '';
        figcaption.style.display = 'none';
      }
    } else if (name === 'alt') {
      if (value) img.setAttribute('alt', value);else img.removeAttribute('alt');
    } else if (name === 'width') {
      if (value) {
        this.domNode.style.width = value;
        img.style.width = '100%';
      } else {
        this.domNode.style.width = '';
        img.style.width = '';
      }
    } else if (name === 'height') {
      if (value) img.style.height = value;else img.style.height = '';
    } else if (name === 'style') {
      if (value) this.domNode.setAttribute('style', value);else this.domNode.removeAttribute('style');
    } else if (name === 'imgStyle') {
      if (value) {
        img.setAttribute('style', value);
      } else {
        img.removeAttribute('style');
        img.style.width = '100%';
      }
    } else {
      super.format(name, value);
    }
  }
}
export default ImageFigure;