import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import * as Options from 'quill/core/quill';
import { ExtraOptions, ModuleOptions } from './types.d.ts';
import mergeModules from './modules.ts';
import { ToolbarCustomizer } from './ui/toolbarCustomizer.ts';
import { handleUploadResponse, uploadStrategies } from './upload-utils.ts';

import './register-modules.ts';
import QuillTableBetter from 'quill-table-better';
import {Mention} from './modules/mention.ts';

interface DOMNode extends HTMLElement {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    hasAttribute(name: string): boolean;
}

const Image = Quill.import('formats/image');
class CustomImage extends Image {
    static formats(domNode: HTMLElement) {
        const formats = super.formats(domNode) || {};
        if (domNode.hasAttribute('style')) formats.style = domNode.getAttribute('style');
        if (domNode.hasAttribute('alt')) formats.alt = domNode.getAttribute('alt');
        if (domNode.hasAttribute('title')) formats.title = domNode.getAttribute('title');
        if (domNode.hasAttribute('data-caption')) formats.caption = domNode.getAttribute('data-caption');
        if (domNode.hasAttribute('width')) formats.width = domNode.getAttribute('width');
        if (domNode.hasAttribute('height')) formats.height = domNode.getAttribute('height');
        return formats;
    }

    format(name: string, value: any) {
        const customAttributes = ['style', 'alt', 'title', 'caption', 'width', 'height'];
        if (customAttributes.includes(name)) {
            const attributeName = name === 'caption' ? 'data-caption' : name;
            value ? this.domNode.setAttribute(attributeName, String(value)) : this.domNode.removeAttribute(attributeName);
        } else {
            super.format(name, value);
        }
    }
}
Quill.register(CustomImage, true);

const Link = Quill.import('formats/link');
class CustomLink extends Link {
    static create(value: any) {
        if (typeof value === 'object' && value.url) {
            const node = super.create(value.url);
            if (value.target) node.setAttribute('target', value.target);
            if (value.rel) node.setAttribute('rel', value.rel);
            return node;
        }
        return super.create(value);
    }

    static formats(domNode: HTMLElement) {
        const href = domNode.getAttribute('href');
        const target = domNode.getAttribute('target');
        const rel = domNode.getAttribute('rel');

        if (target || rel) {
            return { url: href, target, rel };
        }
        return super.formats(domNode);
    }

    format(name: string, value: any) {
        if (name === 'target') {
            if (value) {
                this.domNode.setAttribute('target', String(value));
                if (value === '_blank') {
                    const rel = this.domNode.getAttribute('rel') || '';
                    if (!rel.includes('noopener')) {
                        this.domNode.setAttribute('rel', (rel + ' noopener noreferrer').trim());
                    }
                }
            } else {
                this.domNode.removeAttribute('target');
            }
        } else if (name === 'rel') {
            if (value) {
                const currentRel = this.domNode.getAttribute('rel') || '';
                const parts = currentRel.split(' ').filter(p => p && p !== 'nofollow');
                if (value === 'nofollow') parts.push('nofollow');
                this.domNode.setAttribute('rel', parts.join(' ').trim());
            } else {
                const currentRel = this.domNode.getAttribute('rel') || '';
                const parts = currentRel.split(' ').filter(p => p && p !== 'nofollow');
                parts.length > 0 ? this.domNode.setAttribute('rel', parts.join(' ')) : this.domNode.removeAttribute('rel');
            }
        } else {
            super.format(name, value);
        }
    }

    value() {
        return this.domNode.getAttribute('href');
    }
}
Quill.register(CustomLink, true);

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

    private quillInstance: Quill | null = null;

    connect() {
        // Prevent re-initialization if Quill instance already exists
        // This is important for LiveComponent compatibility
        if (this.quillInstance) {
            return;
        }

        const options = this.buildQuillOptions();
        this.dynamicModuleRegister(options);
        this.setupQuillStyles(options);
        this.setupUploadHandler(options);
        this.setupEditorHeight();

        this.dispatchEvent('options', options);

        const unprocessedIcons = this.processIconReplacementFromQuillCore();

        this.initializeQuill(options, unprocessedIcons);
    }

    disconnect() {
        if (this.quillInstance) {
            this.quillInstance = null;
        }
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
        this.quillInstance = quill;
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
        // Dispatch both 'input' and 'change' events for better compatibility with LiveComponent
        inputContent.dispatchEvent(new Event('input', { bubbles: true }));
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
        if (options.modules && options.modules.syntax) {
            if (options.modules.syntax === true || options.modules.syntax === 'true') {
                // @ts-ignore
                options.modules.syntax = { hljs };
            } else if (typeof options.modules.syntax === 'object') {
                options.modules.syntax.hljs = hljs;
            }
        }

        if (options.modules && options.modules.formula) {
            if (options.modules.formula === true || options.modules.formula === 'true') {
                // @ts-ignore
                options.modules.formula = { katex };
            } else if (typeof options.modules.formula === 'object') {
                options.modules.formula.katex = katex;
            }
        }

        const isTablePresent = options.modules.toolbar
            .flat(Infinity)
            .some(item => typeof item === 'string' && item === 'table-better');

        if (isTablePresent) {
            Quill.register('modules/table-better', QuillTableBetter);
        }

        if (options.modules) {
            for (const moduleName in options.modules) {
                if (moduleName.startsWith('mention')) {
                    Quill.register(`modules/${moduleName}`, Mention);
                }
            }
        }
    }
}
