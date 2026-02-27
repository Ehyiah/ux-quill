import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class ImageFigure extends BlockEmbed {
    static blotName = 'image';
    static tagName = 'figure';
    static className = 'ql-image-figure';

    static create(value: any) {
        const node = super.create();
        const img = document.createElement('img');

        const src = typeof value === 'string' ? value : value.src;
        img.setAttribute('src', src);

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
            if (value.caption) img.setAttribute('data-caption', value.caption);
        }

        node.appendChild(img);

        const figcaption = document.createElement('figcaption');
        if (typeof value === 'object' && value.caption) {
            figcaption.textContent = value.caption;
        }
        node.appendChild(figcaption);

        return node;
    }

    static value(node: HTMLElement) {
        const img = node.querySelector('img');
        const figcaption = node.querySelector('figcaption');
        return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            // Width is on the figure; fall back to img for backward compat
            width: node.style.width || img?.style.width || null,
            height: img?.style.height,
            style: node.getAttribute('style'),
            imgStyle: img?.getAttribute('style') || null,
            caption: figcaption?.textContent || null
        };
    }

    static formats(node: HTMLElement) {
        const img = node.querySelector('img');
        if (!img) return {};

        const figcaption = node.querySelector('figcaption');

        return {
            alt: img.getAttribute('alt'),
            // Width is on the figure; fall back to img for backward compat
            width: node.style.width || (img as HTMLElement).style.width || null,
            height: (img as HTMLElement).style.height,
            style: node.getAttribute('style'),
            imgStyle: img.getAttribute('style') || null,
            caption: figcaption?.textContent || null
        };
    }

    format(name: string, value: any) {
        const img = this.domNode.querySelector('img');
        const figcaption = this.domNode.querySelector('figcaption');

        if (!img || !figcaption) return;

        if (name === 'caption') {
            if (value) {
                figcaption.textContent = value;
                img.setAttribute('data-caption', value);
            } else {
                figcaption.textContent = '';
                img.removeAttribute('data-caption');
            }
        } else if (name === 'alt') {
            if (value) img.setAttribute('alt', value);
            else img.removeAttribute('alt');
        } else if (name === 'width') {
            if (value) {
                this.domNode.style.width = value;
                img.style.width = '100%';
            } else {
                this.domNode.style.width = '';
                img.style.width = '';
            }
        } else if (name === 'height') {
            if (value) img.style.height = value;
            else img.style.height = '';
        } else if (name === 'style') {
            if (value) this.domNode.setAttribute('style', value);
            else this.domNode.removeAttribute('style');
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
