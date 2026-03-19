import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import mergeModules from "./modules.js";
import { ToolbarCustomizer } from "./ui/toolbarCustomizer.js";
import { handleUploadResponse, uploadStrategies } from "./upload-utils.js";
import "./register-modules.js";
import QuillTableBetter from 'quill-table-better';
import ImageFigure from "./blots/imageFigure.js";

// Register custom ImageFigure blot to override default image
Quill.register(ImageFigure, true);
export default class extends Controller {
  static targets = ['input', 'editorContainer'];
  static values = (() => ({
    toolbarOptions: {
      type: Array,
      default: []
    },
    extraOptions: {
      type: Object,
      default: {}
    },
    modulesOptions: {
      type: Array,
      default: []
    }
  }))();
  quillInstance = null;
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
  buildQuillOptions() {
    const {
      debug,
      placeholder,
      theme,
      style
    } = this.extraOptionsValue;
    const readOnly = this.extraOptionsValue.read_only;
    const enabledModules = {
      'toolbar': this.toolbarOptionsValue
    };
    const mergedModules = mergeModules(this.modulesOptionsValue, enabledModules);
    return {
      debug,
      modules: mergedModules,
      placeholder,
      theme,
      style,
      readOnly
    };
  }
  setupQuillStyles(options) {
    if (options.style === 'inline') {
      const styleAttributes = ['align', 'background', 'color', 'direction', 'font', 'size'];
      styleAttributes.forEach(attr => Quill.register(Quill.import(`attributors/style/${attr}`), true));
    }
  }
  setupUploadHandler(options) {
    const config = this.extraOptionsValue.upload_handler;
    if (config?.upload_endpoint && uploadStrategies[config.type]) {
      const uploadFunction = file => uploadStrategies[config.type](config.upload_endpoint, file, config.security).then(response => handleUploadResponse(response, config.json_response_file_path));
      Object.assign(options.modules, {
        imageUploader: {
          upload: uploadFunction
        }
      });
    }
  }
  setupEditorHeight() {
    const height = this.extraOptionsValue.height;
    if (height !== null) {
      this.editorContainerTarget.style.height = height;
    }
  }
  initializeQuill(options, unprocessedIcons) {
    const quill = new Quill(this.editorContainerTarget, options);
    this.quillInstance = quill;
    this.setupContentSync(quill);
    this.processUnprocessedIcons(unprocessedIcons);
    this.dispatchEvent('connect', quill);
  }
  setupContentSync(quill) {
    // set initial content as a delta for better compatibility and allow table-module to work
    const initialData = quill.clipboard.convert({
      html: this.inputTarget.value
    });
    this.dispatchEvent('hydrate:before', initialData);
    quill.updateContents(initialData);
    this.dispatchEvent('hydrate:after', quill);
    quill.on('text-change', () => {
      const quillContent = this.extraOptionsValue?.use_semantic_html ? quill.getSemanticHTML() : quill.root.innerHTML;
      const inputContent = this.inputTarget;
      inputContent.value = quillContent;
      this.bubbles(inputContent);
    });
  }
  bubbles(inputContent) {
    // Dispatch both 'input' and 'change' events for better compatibility with LiveComponent
    inputContent.dispatchEvent(new Event('input', {
      bubbles: true
    }));
    inputContent.dispatchEvent(new Event('change', {
      bubbles: true
    }));
  }
  dispatchEvent(name, payload) {
    if (payload === void 0) {
      payload = {};
    }
    this.dispatch(name, {
      detail: payload,
      prefix: 'quill'
    });
  }
  processIconReplacementFromQuillCore() {
    let unprocessedIcons = {};
    if (this.extraOptionsValue.custom_icons) {
      unprocessedIcons = ToolbarCustomizer.customizeIconsFromQuillRegistry(this.extraOptionsValue.custom_icons);
    }
    return unprocessedIcons;
  }
  processUnprocessedIcons(unprocessedIcons) {
    if (this.extraOptionsValue.custom_icons && Object.keys(unprocessedIcons).length > 0) {
      ToolbarCustomizer.customizeIcons(unprocessedIcons, this.editorContainerTarget.parentElement || undefined);
    }
    if (this.extraOptionsValue.debug === 'info' || this.extraOptionsValue.debug === 'log') {
      ToolbarCustomizer.debugToolbarButtons(this.editorContainerTarget.parentElement || undefined);
    }
  }
  dynamicModuleRegister(options) {
    if (options.modules && options.modules.syntax) {
      if (options.modules.syntax === true || options.modules.syntax === 'true') {
        // @ts-ignore
        options.modules.syntax = {
          hljs
        };
      } else if (typeof options.modules.syntax === 'object') {
        options.modules.syntax.hljs = hljs;
      }
    }
    if (options.modules && options.modules.formula) {
      if (options.modules.formula === true || options.modules.formula === 'true') {
        // @ts-ignore
        options.modules.formula = {
          katex
        };
      } else if (typeof options.modules.formula === 'object') {
        options.modules.formula.katex = katex;
      }
    }
    const isTablePresent = options.modules.toolbar.flat(Infinity).some(item => typeof item === 'string' && item === 'table-better');
    if (isTablePresent) {
      Quill.register('modules/table-better', QuillTableBetter);
    }
  }
}