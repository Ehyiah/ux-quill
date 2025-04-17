import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import * as Options from 'quill/core/quill';
import { EmojiModule, ExtraOptions, ModuleInterface, ResizeModule, uploadOptions } from './typesmodules.d.ts';
import mergeModules from './modules.ts';
import { handleUploadResponse, uploadFileForm, uploadFileJson, uploadStrategies } from './upload-utils.ts';

import ImageUploader from './imageUploader.js'
Quill.register('modules/imageUploader', ImageUploader);

import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
Quill.register('modules/emoji', Emoji);

import QuillResizeImage from 'quill-resize-image';
Quill.register('modules/resize', QuillResizeImage);
// allow image resize and position to be reloaded after persist
const Image = Quill.import('formats/image');
const oldFormats = Image.formats;
Image.formats = function (domNode) {
    const formats = oldFormats(domNode);
    if (domNode.hasAttribute('style')) {
        formats.style = domNode.getAttribute('style');
    }
    return formats;
}

Image.prototype.format = function (name, value) {
    if (value) {
        this.domNode.setAttribute(name, value);
    } else {
        this.domNode.removeAttribute(name);
    }
}

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
        const toolbarOptionsValue = this.toolbarOptionsValue;
        const modulesOptions = this.extraOptionsValue.modules;

        const enabledModules = {
            'toolbar': toolbarOptionsValue,
        };

        const mergedModules = mergeModules(modulesOptions, enabledModules);

        const options: Options = {
            debug: this.extraOptionsValue.debug,
            modules: mergedModules,
            placeholder: this.extraOptionsValue.placeholder,
            theme: this.extraOptionsValue.theme,
            style: this.extraOptionsValue.style,
        };

        if (options.style === 'inline') {
            Quill.register(Quill.import('attributors/style/align'), true);
            Quill.register(Quill.import('attributors/style/background'),true);
            Quill.register(Quill.import('attributors/style/color'), true);
            Quill.register(Quill.import('attributors/style/direction'),true);
            Quill.register(Quill.import('attributors/style/font'), true);
            Quill.register(Quill.import('attributors/style/size'), true);
        }

        const uploadHandlerConfig = this.extraOptionsValue.upload_handler;
        if (uploadHandlerConfig && uploadHandlerConfig.upload_endpoint && uploadStrategies[uploadHandlerConfig.type]) {
            const uploadEndpoint = uploadHandlerConfig.upload_endpoint;
            const uploadFunction = (file) => uploadStrategies[uploadHandlerConfig.type](uploadEndpoint, file)
                .then(response => handleUploadResponse(response, uploadHandlerConfig.json_response_file_path));

            Object.assign(options.modules, {
                imageUploader: {
                    upload: uploadFunction
                }
            });
        }

        const heightDefined = this.extraOptionsValue.height;
        if (null !== heightDefined) {
            this.editorContainerTarget.style.height = heightDefined
        }

        this.dispatchEvent('options', options);

        const quill = new Quill(this.editorContainerTarget, options);
        quill.on('text-change', () => {
            const quillContent = quill.root.innerHTML;
            const inputContent = this.inputTarget;
            inputContent.value = quillContent;
        })

        this.dispatchEvent('connect', quill);
    }

    private dispatchEvent(name: string, payload: any = {}) {
        this.dispatch(name, { detail: payload, prefix: 'quill' });
    }
}
