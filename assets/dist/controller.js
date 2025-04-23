import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import mergeModules from "./modules.js";
import { ToolbarCustomizer } from "./ui/toolbarCustomizer.js";
import { handleUploadResponse, uploadStrategies } from "./upload-utils.js";
import { DynamicModuleLoader } from "./dynamicModuleLoader.js";
const Image = Quill.import('formats/image');
const oldFormats = Image.formats;
Image.formats = function (domNode) {
  const formats = oldFormats.call(this, domNode);
  if (domNode.hasAttribute('style')) {
    formats.style = domNode.getAttribute('style');
  }
  return formats;
};
Image.prototype.format = function (name, value) {
  value ? this.domNode.setAttribute(name, String(value)) : this.domNode.removeAttribute(name);
};
const dynamicModules = [{
  moduleName: 'emoji',
  jsPath: ['quill2-emoji'],
  cssPath: ['quill2-emoji/dist/style.css'],
  toolbarKeyword: 'emoji'
}, {
  moduleName: 'imageUploader',
  jsPath: [() => import("./imageUploader.js")],
  // Fonction d'import pour le module local
  toolbarKeyword: 'upload_handler'
}, {
  moduleName: 'resize',
  jsPath: ['quill-resize-image'],
  toolbarKeyword: 'image'
}, {
  moduleName: 'table-better',
  jsPath: ['quill-table-better'],
  cssPath: ['quill-table-better/dist/quill-table-better.css'],
  toolbarKeyword: 'table-better'
}];
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
  connect() {
    const options = this.buildQuillOptions();
    this.setupQuillStyles(options);
    this.setupUploadHandler(options);
    this.setupEditorHeight();
    this.dispatchEvent('options', options);
    const moduleLoader = new DynamicModuleLoader(dynamicModules);
    const modulesLoadPromise = moduleLoader.loadModules(options);
    const unprocessedIcons = this.processIconReplacementFromQuillCore();
    modulesLoadPromise.then(() => {
      console.log('Tous les modules sont chargés, initialisation de Quill');
      this.initializeQuill(options, unprocessedIcons);
    }).catch(error => {
      console.error('Erreur lors du chargement des modules:', error);
      this.initializeQuill(options, unprocessedIcons);
    });
  }
  buildQuillOptions() {
    const {
      debug,
      placeholder,
      theme,
      style
    } = this.extraOptionsValue;
    const enabledModules = {
      'toolbar': this.toolbarOptionsValue
    };
    const mergedModules = mergeModules(this.modulesOptionsValue, enabledModules);
    return {
      debug,
      modules: mergedModules,
      placeholder,
      theme,
      style
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
      const uploadFunction = file => uploadStrategies[config.type](config.upload_endpoint, file).then(response => handleUploadResponse(response, config.json_response_file_path));
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
    this.setupContentSync(quill);
    this.processUnprocessedIcons(unprocessedIcons);
    this.dispatchEvent('connect', quill);
  }
  setupContentSync(quill) {
    if (this.extraOptionsValue.use_semantic_html) {
      quill.on('text-change', () => {
        const quillContent = quill.getSemanticHTML();
        const inputContent = this.inputTarget;
        inputContent.value = quillContent;
      });
    } else {
      quill.on('text-change', () => {
        const quillContent = quill.root.innerHTML;
        const inputContent = this.inputTarget;
        inputContent.value = quillContent;
      });
    }
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
}