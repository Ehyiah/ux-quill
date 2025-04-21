import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import * as Options from 'quill/core/quill';
import { EmojiModule, ExtraOptions, ModuleInterface, ResizeModule, uploadOptions } from './typesmodules.d.ts';
import mergeModules from './modules.ts';
import { DynamicModuleLoader, DynamicQuillModule } from './dynamicModuleLoader.ts';

import axios from 'axios';

import ImageUploader from './imageUploader.js'
Quill.register('modules/imageUploader', ImageUploader);

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

const dynamicModules: DynamicQuillModule[] = [
    {
        moduleName: 'emoji',
        jsPath: ['quill2-emoji'],
        cssPath: ['quill2-emoji/dist/style.css'],
        toolbarKeyword: 'emoji'
    }
];

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

        const moduleLoader = new DynamicModuleLoader(dynamicModules);

        const options: Options = {
            debug: this.extraOptionsValue.debug,
            modules: mergedModules,
            placeholder: this.extraOptionsValue.placeholder,
            theme: this.extraOptionsValue.theme,
            style: this.extraOptionsValue.style,
        };

        const modulesLoadPromise = moduleLoader.loadModules(options);

        if (options.style === 'inline') {
            Quill.register(Quill.import('attributors/style/align'), true);
            Quill.register(Quill.import('attributors/style/background'),true);
            Quill.register(Quill.import('attributors/style/color'), true);
            Quill.register(Quill.import('attributors/style/direction'),true);
            Quill.register(Quill.import('attributors/style/font'), true);
            Quill.register(Quill.import('attributors/style/size'), true);
        }

        if (this.extraOptionsValue.upload_handler.path !== null && this.extraOptionsValue.upload_handler.type === 'form') {
            Object.assign(options.modules, {
                imageUploader: {
                    upload: file => {
                        return new Promise((resolve, reject) => {
                            const formData = new FormData();
                            formData.append('file', file);

                            axios
                                .post(this.extraOptionsValue.upload_handler.path, formData)
                                .then(response => {
                                    resolve(response.data);
                                })
                                .catch(err => {
                                    reject('Upload failed');
                                    console.log(err)
                                })
                        })
                    }
                }}
            )
        }

        if (this.extraOptionsValue.upload_handler.path !== null && this.extraOptionsValue.upload_handler.type === 'json') {
            Object.assign(options.modules, {
                imageUploader: {
                    upload: file => {
                        return new Promise((resolve, reject) => {
                            const reader = (file) => {
                                return new Promise((resolve) => {
                                    const fileReader = new FileReader();
                                    fileReader.onload = () => resolve(fileReader.result);
                                    fileReader.readAsDataURL(file);
                                });
                            }

                            reader(file).then(result =>
                                axios
                                    .post(this.extraOptionsValue.upload_handler.path, result, {
                                        headers: {
                                            'Content-Type': 'application/json',
                                        }
                                    })
                                    .then(response => {
                                        resolve(response.data);
                                    })
                                    .catch(err => {
                                        reject('Upload failed');
                                        console.log(err)
                                    })
                            );
                        })
                    }
                }}
            )
        }

        const heightDefined = this.extraOptionsValue.height;
        if (null !== heightDefined) {
            this.editorContainerTarget.style.height = heightDefined
        }

        this.dispatchEvent('options', options);

        modulesLoadPromise.then(() => {
            console.log('Tous les modules sont chargés, initialisation de Quill');
            this.initializeQuill(options);
        }).catch(error => {
            console.error('Erreur lors du chargement des modules:', error);
            this.initializeQuill(options);
        });
            }

        private initializeQuill(options: Options): void {
            const quill = new Quill(this.editorContainerTarget, options);

            quill.on('text-change', () => {
                const quillContent = quill.root.innerHTML;
                const inputContent = this.inputTarget;
                inputContent.value = quillContent;
            });

            this.dispatchEvent('connect', quill);
    }

    private dispatchEvent(name: string, payload: any = {}) {
        this.dispatch(name, { detail: payload, prefix: 'quill' });
    }
}
