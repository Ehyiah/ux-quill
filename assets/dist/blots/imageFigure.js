import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
class ImageFigure extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const img = document.createElement('img');
    const src = typeof value === 'string' ? value : value.src;
    img.setAttribute('src', src);
    const figcaption = document.createElement('figcaption');

    // Base critical styles for figure using table layout for maximum stability with floats
    node.style.display = 'table';
    node.style.flexDirection = ''; // Reset flex
    node.style.maxWidth = '100%';
    node.style.boxSizing = 'border-box';
    node.style.verticalAlign = 'top';
    node.style.userSelect = 'none';
    node.setAttribute('contenteditable', 'false');

    // Base styles for figcaption
    figcaption.style.display = 'table-caption';
    figcaption.style.captionSide = 'bottom';
    figcaption.style.background = 'var(--ql-caption-bg-color, rgba(51, 51, 51, 0.6))';
    figcaption.style.color = '#fff';
    figcaption.style.fontSize = '11px';
    figcaption.style.padding = '4px 8px';
    figcaption.style.textAlign = 'center';
    figcaption.style.width = '100%';
    figcaption.style.boxSizing = 'border-box';
    figcaption.style.lineHeight = 'normal';
    figcaption.style.fontStyle = 'italic';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    if (typeof value === 'object') {
      if (value.alt) img.setAttribute('alt', value.alt);
      if (value.style) {
        node.setAttribute('style', value.style);
        // Ensure critical layout styles
        node.style.display = 'table';
        node.style.verticalAlign = 'top';
      }
      if (value.imgStyle) {
        img.setAttribute('style', value.imgStyle);
        if (!img.style.display) img.style.display = 'block';
        if (!img.style.margin) img.style.margin = '0 auto';
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
        figcaption.style.display = 'table-caption';
      } else {
        img.removeAttribute('data-caption');
        figcaption.textContent = '';
        figcaption.style.display = 'none';
      }
      if (value.link) {
        const link = document.createElement('a');
        link.setAttribute('href', value.link);
        if (value.linkTarget) {
          link.setAttribute('target', value.linkTarget);
          if (value.linkTarget === '_blank') {
            link.setAttribute('rel', 'noopener noreferrer');
          }
        }
        link.style.display = 'block';
        link.style.width = '100%';
        link.appendChild(img);
        node.appendChild(link);
      } else {
        node.appendChild(img);
      }
    } else {
      figcaption.style.display = 'none';
      node.appendChild(img);
    }
    node.appendChild(figcaption);
    return node;
  }
  static value(node) {
    var _figcaption$textConte;
    const img = node.querySelector('img');
    const figcaption = node.querySelector('figcaption');
    const link = node.querySelector('a');
    let caption = (img == null ? void 0 : img.getAttribute('data-caption')) || (figcaption == null || (_figcaption$textConte = figcaption.textContent) == null ? void 0 : _figcaption$textConte.trim()) || null;
    if (figcaption && figcaption.style.display === 'none') {
      caption = null;
    }
    return {
      src: img == null ? void 0 : img.getAttribute('src'),
      alt: img == null ? void 0 : img.getAttribute('alt'),
      width: node.style.width || (img == null ? void 0 : img.style.width) || null,
      height: img == null ? void 0 : img.style.height,
      style: node.getAttribute('style'),
      imgStyle: (img == null ? void 0 : img.getAttribute('style')) || null,
      caption: caption,
      link: (link == null ? void 0 : link.getAttribute('href')) || null,
      linkTarget: (link == null ? void 0 : link.getAttribute('target')) || null
    };
  }
  static formats(node) {
    var _figcaption$textConte2;
    const img = node.querySelector('img');
    if (!img) return {};
    const figcaption = node.querySelector('figcaption');
    const link = node.querySelector('a');
    let caption = img.getAttribute('data-caption') || (figcaption == null || (_figcaption$textConte2 = figcaption.textContent) == null ? void 0 : _figcaption$textConte2.trim()) || null;
    if (figcaption && figcaption.style.display === 'none') {
      caption = null;
    }
    return {
      alt: img.getAttribute('alt'),
      width: node.style.width || img.style.width || null,
      height: img.style.height,
      style: node.getAttribute('style'),
      imgStyle: img.getAttribute('style') || null,
      caption: caption,
      link: (link == null ? void 0 : link.getAttribute('href')) || null,
      linkTarget: (link == null ? void 0 : link.getAttribute('target')) || null
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
        figcaption.style.display = 'table-caption';
      } else {
        img.removeAttribute('data-caption');
        figcaption.textContent = '';
        figcaption.style.display = 'none';
      }
    } else if (name === 'link') {
      const existingLink = this.domNode.querySelector('a');
      if (value) {
        if (existingLink) {
          existingLink.setAttribute('href', value);
        } else {
          var _img$parentNode;
          const link = document.createElement('a');
          link.setAttribute('href', value);
          link.style.display = 'block';
          link.style.width = '100%';
          (_img$parentNode = img.parentNode) == null || _img$parentNode.replaceChild(link, img);
          link.appendChild(img);
        }
      } else if (existingLink) {
        var _existingLink$parentN;
        (_existingLink$parentN = existingLink.parentNode) == null || _existingLink$parentN.replaceChild(img, existingLink);
      }
    } else if (name === 'linkTarget') {
      const link = this.domNode.querySelector('a');
      if (link) {
        if (value) {
          link.setAttribute('target', value);
          if (value === '_blank') {
            link.setAttribute('rel', 'noopener noreferrer');
          } else {
            link.removeAttribute('rel');
          }
        } else {
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }
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
ImageFigure.blotName = 'image';
ImageFigure.tagName = 'figure';
ImageFigure.className = 'ql-image-figure';
export default ImageFigure;