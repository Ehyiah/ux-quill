import { RewriteFeature } from "./features/rewriteFeature";
import { TranslateFeature } from "./features/translateFeature";
import { GrammarFeature } from "./features/grammarFeature";
import { GenerateFeature } from "./features/generateFeature";
import { SummarizeFeature } from "./features/summarizeFeature";
import { SemanticFeature } from "./features/semanticFeature";
import { TocFeature } from "./features/tocFeature";
export class AiAssistantModule {
  constructor(quill, options) {
    this.quill = void 0;
    this.aiManager = void 0;
    this.featureInstances = [];
    this.button = null;
    this.dropdown = null;
    this.initialized = false;
    this.quill = quill;
    this.aiManager = options.aiManager;
    this.initializeFeatures(options);
    this.addToolbarButton();
  }
  initializeFeatures(options) {
    const features = options.features || {};
    const featureMap = {
      rewrite: RewriteFeature,
      translate: TranslateFeature,
      grammar: GrammarFeature,
      generate: GenerateFeature,
      summarize: SummarizeFeature,
      semantic: SemanticFeature,
      toc: TocFeature
    };
    Object.entries(features).forEach(_ref => {
      let [key, config] = _ref;
      const FeatureClass = featureMap[key];
      if (FeatureClass && this.aiManager.isFeatureSupported(key)) {
        const featureConfig = typeof config === 'object' && config !== null ? config : {};
        this.featureInstances.push(new FeatureClass(this.quill, this.aiManager, featureConfig));
      }
    });
  }
  addToolbarButton() {
    if (this.featureInstances.length === 0) return;
    const toolbar = this.quill.getModule('toolbar');
    if (!toolbar || !toolbar.container) return;
    this.button = document.createElement('button');
    this.button.className = 'ql-ai-assistant';
    this.button.innerHTML = "\n      <svg viewBox=\"0 0 18 18\" style=\"width:18px;height:18px;\">\n        <path d=\"M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z\" \n              class=\"ql-fill\" fill=\"currentColor\"/>\n      </svg>\n    ";
    this.button.title = 'AI Assistant';
    this.button.style.cssText = 'position:relative;';
    this.button.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    const lastButton = toolbar.container.querySelector('.ql-ai-assistant');
    if (lastButton) {
      toolbar.container.insertBefore(this.button, lastButton);
    } else {
      toolbar.container.appendChild(this.button);
    }
  }
  toggleDropdown() {
    var _toolbar$container;
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
      return;
    }
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ql-ai-dropdown';
    this.dropdown.style.cssText = "\n      position:absolute;top:100%;left:0;background:#fff;border:1px solid #ccc;\n      border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;\n      min-width:200px;white-space:nowrap;\n    ";
    this.featureInstances.forEach(feature => {
      const item = document.createElement('button');
      item.textContent = feature.label;
      item.className = 'ql-ai-dropdown-item';
      item.style.cssText = "\n        display:block;width:100%;padding:8px 16px;border:none;background:none;\n        text-align:left;cursor:pointer;font-size:14px;font-family:inherit;\n      ";
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f0f0f0';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = '';
      });
      item.addEventListener('click', e => {
        e.stopPropagation();
        this.closeDropdown();
        feature.trigger();
      });
      this.dropdown.appendChild(item);
    });
    const rect = this.button.getBoundingClientRect();
    const toolbar = this.quill.getModule('toolbar');
    if (toolbar != null && toolbar.container) {
      const toolbarRect = toolbar.container.getBoundingClientRect();
      this.dropdown.style.left = rect.left - toolbarRect.left + "px";
      this.dropdown.style.top = rect.bottom - toolbarRect.top + "px";
    }
    toolbar == null || (_toolbar$container = toolbar.container) == null || _toolbar$container.appendChild(this.dropdown);
    const closeHandler = e => {
      if (this.dropdown && !this.dropdown.contains(e.target) && e.target !== this.button) {
        this.closeDropdown();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }
  closeDropdown() {
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
    }
  }
}