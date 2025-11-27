import { Controller } from '@hotwired/stimulus';
import Quill from 'quill';
import mergeModules from "./modules.js";
import { ToolbarCustomizer } from "./ui/toolbarCustomizer.js";
import { handleUploadResponse, uploadStrategies } from "./upload-utils.js";
import "./register-modules.js";
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
    const unprocessedIcons = this.processIconReplacementFromQuillCore();
    this.initializeQuill(options, unprocessedIcons);
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
    this.setupContentSync(quill);
    this.processUnprocessedIcons(unprocessedIcons);
    this.dispatchEvent('connect', quill);
  }
  setupContentSync(quill) {
    const htmlContent = this.inputTarget.value;

    // Check if HTML contains a table
    if (htmlContent.includes('<table')) {
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const tableElement = doc.querySelector('table');
      if (tableElement) {
        quill.setText('');
        const scroll = quill.scroll;

        // Create table blot
        const tableBlot = scroll.create('table');
        const tbodyBlot = scroll.create('table-body');

        // Parse each row
        const rows = tableElement.querySelectorAll('tr');
        rows.forEach((trElement, rowIndex) => {
          const rowBlot = scroll.create('table-row', {
            row: rowIndex.toString()
          });

          // Parse each cell in the row
          const cells = trElement.querySelectorAll('td, th');
          cells.forEach((tdElement, colIndex) => {
            const cellBlot = scroll.create('table-cell', {
              row: rowIndex.toString(),
              col: colIndex.toString()
            });

            // Get text content from cell
            const textContent = tdElement.textContent || '';
            const blockBlot = scroll.create('table-cell-block');
            if (textContent.trim()) {
              blockBlot.insertAt(0, textContent);
            } else {
              blockBlot.appendChild(scroll.create('break'));
            }
            cellBlot.appendChild(blockBlot);
            rowBlot.appendChild(cellBlot);
          });
          tbodyBlot.appendChild(rowBlot);
        });
        tableBlot.appendChild(tbodyBlot);

        // Insert table at position 0
        scroll.insertBefore(tableBlot, scroll.children.head);
      }
    } else {
      const initialData = quill.clipboard.convert({
        html: htmlContent
      });
      quill.updateContents(initialData);
    }
    this.dispatchEvent('hydrate:after', quill);
    quill.on('text-change', () => {
      const quillContent = this.extraOptionsValue?.use_semantic_html ? quill.getSemanticHTML() : quill.root.innerHTML;
      const inputContent = this.inputTarget;
      inputContent.value = quillContent;
      this.bubbles(inputContent);
    });
  }
  bubbles(inputContent) {
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
}