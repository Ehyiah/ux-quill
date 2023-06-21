import { Controller } from '@hotwired/stimulus';
import Quill from 'quill/dist/quill'

type ExtraOptions = {
    theme: string;
    debug: string|null;
    height: string|null;
    placeholder: string|null;
}

export default class extends Controller {
    readonly inputTarget: HTMLDivElement;
    readonly toolbarOptionsValue: HTMLDivElement;
    readonly extraOptionsValue: ExtraOptions;
    readonly editorContainerTarget: HTMLDivElement;

    static targets = ['input', 'editorContainer'];
    static values = {
        toolbarOptions: {
            type: Array,
            default: [],
        },
        extraOptions: {
            type: Object,
            default: {},
        }
    }

    connect() {
        const toolbarOptionsValue = this.toolbarOptionsValue;

        const options = {
            debug: this.extraOptionsValue.debug,
            modules: {
                toolbar: toolbarOptionsValue,
            },
            placeholder: this.extraOptionsValue.placeholder,
            theme: this.extraOptionsValue.theme,
        };

        const heightDefined = this.extraOptionsValue.height;
        if (null !== heightDefined) {
            this.editorContainerTarget.style.height = this.extraOptionsValue.height
        }

        const quill = new Quill('.quill-editor', options);
        quill.on('text-change', (delta, deltaResult, source) => {
            this.inputTarget.innerHTML = quill.root.innerHTML;
        })
    }
}
