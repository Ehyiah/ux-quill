import Quill from 'quill';

const InlineBlot = Quill.import('blots/block');

class LoadingImage extends InlineBlot {
    static blotName = 'imageBlot';
    static className = 'image-uploading';
    static tagName = 'span';

    static create(src) {
        const node = super.create(src);
        if (src === true) return node;

        const image = document.createElement('img');
        image.setAttribute('src', src);
        node.appendChild(image);
        return node;
    }

    deleteAt(index, length) {
        super.deleteAt(index, length);
        this.cache = {};
    }

    static value(domNode) {
        const { src, custom } = domNode.dataset;
        return { src, custom };
    }
}

Quill.register({ 'formats/imageBlot': LoadingImage });

export default LoadingImage;
