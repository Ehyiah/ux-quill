import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import * as Options from 'quill/core/quill';
import { ExtraOptions, ModuleOptions } from './types.d.ts';
import mergeModules from './modules.ts';
import { ToolbarCustomizer } from './ui/toolbarCustomizer.ts';
import { handleUploadResponse, uploadStrategies } from './upload-utils.ts';

import './register-modules.ts';
import QuillTableBetter from 'quill-table-better';
import 'quill-table-better/dist/quill-table-better.css';

interface DOMNode extends HTMLElement {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    hasAttribute(name: string): boolean;
}

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
    declare readonly modulesOptionsValue: ModuleOptions;
    static values = {
        toolbarOptions: {
            type: Array,
            default: [],
        },
        extraOptions: {
            type: Object,
            default: {},
        },
        modulesOptions: {
            type: Array,
            default: [],
        }
    }

    connect() {
        const options = this.buildQuillOptions();
        this.dynamicModuleRegister(options);
        this.setupQuillStyles(options);
        this.setupUploadHandler(options);
        this.setupEditorHeight();

        this.dispatchEvent('options', options);

        const unprocessedIcons = this.processIconReplacementFromQuillCore();

        this.initializeQuill(options, unprocessedIcons);
    }

    private buildQuillOptions(): Options {
        const { debug, placeholder, theme, style } = this.extraOptionsValue;
        const readOnly = this.extraOptionsValue.read_only;
        const enabledModules: Options = {
            'toolbar': this.toolbarOptionsValue,
        };
        const mergedModules = mergeModules(this.modulesOptionsValue, enabledModules);

        return {
            debug,
            modules: mergedModules,
            placeholder,
            theme,
            style,
            readOnly,
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
                file,
                config.security,
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

    private initializeQuill(options: Options, unprocessedIcons): void {
        const quill = new Quill(this.editorContainerTarget, options);
        this.setupContentSync(quill);

        this.processUnprocessedIcons(unprocessedIcons);

        this.dispatchEvent('connect', quill);
    }

    private setupContentSync(quill: Quill) {
        // set initial content as a delta for better compatibility and allow table-module to work
        const initialData = quill.clipboard.convert({html: this.inputTarget.value})
        this.dispatchEvent('hydrate:before', initialData);
        quill.updateContents(initialData);
        this.dispatchEvent('hydrate:after', quill);

        quill.on('text-change', () => {
            const quillContent = this.extraOptionsValue?.use_semantic_html
                ? quill.getSemanticHTML()
                : quill.root.innerHTML;

            const inputContent = this.inputTarget;
            inputContent.value = quillContent;
            this.bubbles(inputContent);
        });
    }

    private bubbles(inputContent: HTMLInputElement)
    {
        inputContent.dispatchEvent(new Event('change', { bubbles: true }));
    }

    private dispatchEvent(name: string, payload: any = {}) {
        this.dispatch(name, { detail: payload, prefix: 'quill' });
    }

    private processIconReplacementFromQuillCore(): {[key: string]: string} {
        let unprocessedIcons = {};
        if (this.extraOptionsValue.custom_icons) {
            unprocessedIcons = ToolbarCustomizer.customizeIconsFromQuillRegistry(this.extraOptionsValue.custom_icons);
        }

        return unprocessedIcons;
    }

    private processUnprocessedIcons(unprocessedIcons: {[key: string]: string}): void {
        if (this.extraOptionsValue.custom_icons && Object.keys(unprocessedIcons).length > 0) {
            ToolbarCustomizer.customizeIcons(
                unprocessedIcons,
                this.editorContainerTarget.parentElement || undefined
            );
        }

        if (this.extraOptionsValue.debug === 'info' || this.extraOptionsValue.debug === 'log') {
            ToolbarCustomizer.debugToolbarButtons(this.editorContainerTarget.parentElement || undefined);
        }
    }

    private dynamicModuleRegister(options: Options)
    {
        const isTablePresent = options.modules.toolbar
            .flat(Infinity)
            .some(item => typeof item === 'string' && item === 'table-better');

        if (isTablePresent) {
            Quill.register('modules/table-better', QuillTableBetter);
        }
    }
}
