import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class VideoFigure extends BlockEmbed {
    static blotName = 'video';
    static tagName = 'figure';
    static className = 'ql-video-figure';

    static create(value: any) {
        const node = super.create();
        const iframe = document.createElement('iframe');
        iframe.className = 'ql-video';

        const src = typeof value === 'string' ? value : value.src;
        iframe.setAttribute('src', src);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('loading', 'lazy');

        const figcaption = document.createElement('figcaption');

        node.style.display = 'flex';
        node.style.flexDirection = 'column';
        node.style.maxWidth = '100%';
        node.style.boxSizing = 'border-box';
        node.style.userSelect = 'none';
        node.setAttribute('contenteditable', 'false');

        figcaption.style.background = 'var(--ql-caption-bg-color, rgba(51, 51, 51, 0.6))';
        figcaption.style.color = '#fff';
        figcaption.style.fontSize = '11px';
        figcaption.style.padding = '4px 8px';
        figcaption.style.textAlign = 'center';
        figcaption.style.width = '100%';
        figcaption.style.boxSizing = 'border-box';
        figcaption.style.lineHeight = 'normal';
        figcaption.style.fontStyle = 'italic';

        iframe.style.display = 'block';
        iframe.style.width = '100%';
        iframe.style.height = 'auto';
        iframe.style.aspectRatio = '16 / 9';

        if (typeof value === 'object') {
            if (value.title) iframe.setAttribute('title', value.title);
            if (value.loading) iframe.setAttribute('loading', value.loading);
            if (value.style) {
                node.setAttribute('style', value.style);
                node.style.display = 'flex';
                node.style.flexDirection = 'column';
            }
            if (value.height) iframe.style.height = value.height;
            if (value.width && !node.style.width) node.style.width = value.width;

            if (value.caption && value.caption.trim()) {
                const cleanCaption = value.caption.trim();
                figcaption.textContent = cleanCaption;
                figcaption.style.display = 'block';
            } else {
                figcaption.textContent = '';
                figcaption.style.display = 'none';
            }
        } else {
            figcaption.style.display = 'none';
        }

        if (!node.style.width) {
            node.style.width = '50%';
        }

        node.appendChild(iframe);
        node.appendChild(figcaption);

        return node;
    }

    static value(node: HTMLElement) {
        const iframe = node.querySelector('iframe');
        const figcaption = node.querySelector('figcaption');

        let caption = figcaption?.textContent?.trim() || null;
        if (figcaption && (figcaption as HTMLElement).style.display === 'none') {
            caption = null;
        }

        return {
            src: iframe?.getAttribute('src'),
            title: iframe?.getAttribute('title'),
            loading: iframe?.getAttribute('loading') || 'lazy',
            width: node.style.width || null,
            height: iframe?.style.height || null,
            style: node.getAttribute('style'),
            caption: caption,
        };
    }

    static formats(node: HTMLElement) {
        const iframe = node.querySelector('iframe');
        if (!iframe) return {};

        const figcaption = node.querySelector('figcaption') as HTMLElement;

        let caption = figcaption?.textContent?.trim() || null;
        if (figcaption && figcaption.style.display === 'none') {
            caption = null;
        }

        return {
            title: iframe.getAttribute('title'),
            loading: iframe.getAttribute('loading') || 'lazy',
            width: node.style.width || null,
            height: (iframe as HTMLElement).style.height || null,
            style: node.getAttribute('style'),
            caption: caption,
        };
    }

    format(name: string, value: any) {
        const iframe = this.domNode.querySelector('iframe');
        const figcaption = this.domNode.querySelector('figcaption') as HTMLElement;

        if (!iframe || !figcaption) return;

        if (name === 'caption') {
            if (value && value.trim()) {
                const cleanCaption = value.trim();
                figcaption.textContent = cleanCaption;
                figcaption.style.display = 'block';
            } else {
                figcaption.textContent = '';
                figcaption.style.display = 'none';
            }
        } else if (name === 'title') {
            if (value) iframe.setAttribute('title', value);
            else iframe.removeAttribute('title');
        } else if (name === 'loading') {
            if (value && value !== 'lazy') iframe.setAttribute('loading', value);
            else iframe.setAttribute('loading', 'lazy');
        } else if (name === 'width') {
            if (value) {
                this.domNode.style.width = value;
                iframe.style.width = '100%';
            } else {
                this.domNode.style.width = '';
                iframe.style.width = '';
            }
        } else if (name === 'height') {
            if (value) iframe.style.height = value;
            else iframe.style.height = '';
        } else if (name === 'style') {
            if (value) {
                this.domNode.setAttribute('style', value);
                this.domNode.style.display = 'flex';
                this.domNode.style.flexDirection = 'column';
            } else {
                this.domNode.removeAttribute('style');
            }
        } else {
            super.format(name, value);
        }
    }
}

export default VideoFigure;
