import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import mergeModules from "./modules.js";
import { ToolbarCustomizer } from "./ui/toolbarCustomizer.js";
import { handleUploadResponse, uploadStrategies } from "./upload-utils.js";
import ImageUploader from "./imageUploader.js";
import * as Emoji from 'quill2-emoji';
import 'quill2-emoji/dist/style.css';
import QuillResizeImage from 'quill-resize-image';
const modules = {
  'imageUploader': ImageUploader,
  'emoji': Emoji,
  'resize': QuillResizeImage
};
Object.entries(modules).forEach(_ref => {
  let [name, module] = _ref;
  Quill.register("modules/" + name, module);
});
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
export default class _Class extends Controller {
  connect() {
    const options = this.buildQuillOptions();
    const unprocessedIcons = this.processIconReplacementFromQuillCore();
    this.setupQuillStyles(options);
    this.setupUploadHandler(options);
    this.setupEditorHeight();
    this.dispatchEvent('options', options);
    const quill = new Quill(this.editorContainerTarget, options);
    this.setupContentSync(quill);
    this.processUnprocessedIcons(unprocessedIcons);
    this.dispatchEvent('connect', quill);
  }
  buildQuillOptions() {
    const {
      debug,
      modules: modulesOptions,
      placeholder,
      theme,
      style
    } = this.extraOptionsValue;
    const enabledModules = {
      'toolbar': this.toolbarOptionsValue
    };
    return {
      debug,
      modules: mergeModules(modulesOptions, enabledModules),
      placeholder,
      theme,
      style
    };
  }
  setupQuillStyles(options) {
    if (options.style === 'inline') {
      const styleAttributes = ['align', 'background', 'color', 'direction', 'font', 'size'];
      styleAttributes.forEach(attr => Quill.register(Quill.import("attributors/style/" + attr), true));
    }
  }
  setupUploadHandler(options) {
    const config = this.extraOptionsValue.upload_handler;
    if (config != null && config.upload_endpoint && uploadStrategies[config.type]) {
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
    this.dispatchEvent('connect', quill);
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
_Class.targets = ['input', 'editorContainer'];
_Class.values = {
  toolbarOptions: {
    type: Array,
    default: []
  },
  extraOptions: {
    type: Object,
    default: {}
  }
};