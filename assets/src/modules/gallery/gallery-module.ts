import GalleryModal from './gallery-modal.ts';
import Quill from 'quill';
import 'styles/gallery/gallery.css';

type MediaGalleryOptions = {
    uploadEndpoint: string;
    listEndpoint: string;
    searchEndpoint: string;
    icon: string;
    buttonTitle: string;
    uploadTitle: string;
    messageLoadingOption: string;
    messageNextPageOption: string;
    messagePrevPageOption: string;
    messageErrorOption: string;
    messageNoImageOption: string;
    messageSearchPlaceholderOption: string;
}

export default class GalleryModule {
    private quill: Quill;
    public options: MediaGalleryOptions;
    private modal: GalleryModal;

    constructor(quill: Quill, options: MediaGalleryOptions) {
        this.quill = quill
        this.options = {
            uploadEndpoint: options.uploadEndpoint || '',
            listEndpoint: options.listEndpoint || '',
            searchEndpoint: options.searchEndpoint || '',
            icon: options.icon,
            buttonTitle: options.buttonTitle || '',
            uploadTitle: options.uploadTitle || '',
            messageLoadingOption: options.messageLoadingOption || '',
            messageNextPageOption: options.messageNextPageOption || '',
            messagePrevPageOption: options.messagePrevPageOption || '',
            messageErrorOption: options.messageErrorOption || '',
            messageNoImageOption: options.messageNoImageOption || '',
            messageSearchPlaceholderOption: options.messageSearchPlaceholderOption || '',
        }

        if (!this.options.listEndpoint) {
            throw new Error('listEndpoint option is mandatory for GalleryModule');
        }

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

        const group = document.createElement('span');
        group.classList.add('ql-formats');
        group.appendChild(button);
        toolbar.container.appendChild(group);
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

    async list(url = null) {
        const endpoint = url || this.options.listEndpoint;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Erreur while loading : ${response.statusText}`);
        return response.json();
    }

    async search(query) {
        if (!this.options.searchEndpoint) return this.list();

        const url = new URL(this.options.searchEndpoint, window.location.origin);
        url.searchParams.append('term', query);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Erreur while searching : ${response.statusText}`);
        return response.json();
    }
}
