import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import * as Options from 'quill/core/quill';
import { ExtraOptions } from './typesmodules.d.ts';
import mergeModules from './modules.ts';
import { handleUploadResponse, uploadStrategies } from './upload-utils.ts';

import ImageUploader from './imageUploader.ts';
import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
import QuillResizeImage from 'quill-resize-image';

interface DOMNode extends HTMLElement {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    hasAttribute(name: string): boolean;
}

const modules = {
    'imageUploader': ImageUploader,
    'emoji': Emoji,
    'resize': QuillResizeImage
};

Object.entries(modules).forEach(([name, module]) => {
    Quill.register(`modules/${name}`, module);
});

const Image = Quill.import('formats/image');
const oldFormats = Image.formats;

Image.formats = function(domNode: DOMNode) {
    const formats = oldFormats.call(this, domNode);
    if (domNode.hasAttribute('style')) {
        formats.style = domNode.getAttribute('style');
    }
    return formats;
};

type ImageWithDOM = {
    domNode: DOMNode;
    format(name: string, value: string | boolean | null): void;
};

Image.prototype.format = function(this: ImageWithDOM, name: string, value: string | boolean | null) {
    value ? this.domNode.setAttribute(name, String(value)) : this.domNode.removeAttribute(name);
};

export default class extends Controller {
    declare readonly inputTarget: HTMLInputElement;
    declare readonly editorContainerTarget: HTMLDivElement;
    static targets = ['input', 'editorContainer'];

    declare readonly extraOptionsValue: ExtraOptions;
    declare readonly toolbarOptionsValue: HTMLDivElement;
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
        const options = this.buildQuillOptions();
        this.setupQuillStyles(options);
        this.setupUploadHandler(options);
        this.setupEditorHeight();

        this.dispatchEvent('options', options);

        const quill = new Quill(this.editorContainerTarget, options);
        this.setupContentSync(quill);

        this.dispatchEvent('connect', quill);
    }

    private buildQuillOptions(): Options {
        const { debug, modules: modulesOptions, placeholder, theme, style } = this.extraOptionsValue;

        const enabledModules = {
            'toolbar': this.toolbarOptionsValue,
        };

        return {
            debug,
            modules: mergeModules(modulesOptions, enabledModules),
            placeholder,
            theme,
            style,
        };
    }

    private setupQuillStyles(options: Options) {
        if (options.style === 'inline') {
            const styleAttributes = ['align', 'background', 'color', 'direction', 'font', 'size'];
            styleAttributes.forEach(attr =>
                Quill.register(Quill.import(`attributors/style/${attr}`), true)
            );
        }
    }

    private setupUploadHandler(options: Options) {
        const config = this.extraOptionsValue.upload_handler;

        if (config?.upload_endpoint && uploadStrategies[config.type]) {
            const uploadFunction = (file: File): Promise<string> => uploadStrategies[config.type](
                config.upload_endpoint,
                file
            ).then(response => handleUploadResponse(
                response,
                config.json_response_file_path
            ));

            Object.assign(options.modules, {
                imageUploader: {
                    upload: uploadFunction
                }
            });
        }
    }

    private setupEditorHeight() {
        const height = this.extraOptionsValue.height;
        if (height !== null) {
            this.editorContainerTarget.style.height = height;
        }
    }

    private setupContentSync(quill: Quill) {
        if (this.extraOptionsValue.use_semantic_html) {
            quill.on('text-change', () => {
                const quillContent = quill.getSemanticHTML();
                const inputContent = this.inputTarget;
                inputContent.value = quillContent;
            })
        } else {
            quill.on('text-change', () => {
                const quillContent = quill.root.innerHTML;
                const inputContent = this.inputTarget;
                inputContent.value = quillContent;
            })
        }
    }

    private dispatchEvent(name: string, payload: any = {}) {
        this.dispatch(name, { detail: payload, prefix: 'quill' });
    }
}
