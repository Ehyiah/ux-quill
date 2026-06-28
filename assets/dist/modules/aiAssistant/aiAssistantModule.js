import { RewriteFeature } from "./features/rewriteFeature.js";
import { TranslateFeature } from "./features/translateFeature.js";
import { GrammarFeature } from "./features/grammarFeature.js";
import { GenerateFeature } from "./features/generateFeature.js";
import { SummarizeFeature } from "./features/summarizeFeature.js";
import { SemanticFeature } from "./features/semanticFeature.js";
import { TocFeature } from "./features/tocFeature.js";
const FEATURE_META = {
  rewrite: {
    icon: '\u270D\uFE0F',
    desc: 'Changer le style du texte s\u00E9lectionn\u00E9',
    group: 'edit'
  },
  translate: {
    icon: '\uD83C\uDF10',
    desc: 'Traduire dans une autre langue',
    group: 'edit'
  },
  grammar: {
    icon: '\u2714\uFE0F',
    desc: 'Corriger les fautes d\u2019orthographe',
    group: 'edit'
  },
  summarize: {
    icon: '\uD83D\uDCDD',
    desc: 'R\u00E9sumer le contenu',
    group: 'create'
  },
  generate: {
    icon: '\u2728',
    desc: 'G\u00E9n\u00E9rer du texte par IA',
    group: 'create'
  },
  semantic: {
    icon: '\uD83D\uDCCA',
    desc: 'Analyser les mots-cl\u00E9s et sujets',
    group: 'analyze'
  },
  toc: {
    icon: '\uD83D\uDCD1',
    desc: 'Cr\u00E9er une table des mati\u00E8res',
    group: 'analyze'
  }
};
const GROUP_LABELS = {
  edit: '\u00C9dition',
  create: 'Cr\u00E9ation',
  analyze: 'Analyse'
};
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = "\n.ai-assistant-wrapper {\n  position: relative;\n  display: inline-block;\n}\n\n.ai-assistant-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 24px;\n  padding: 3px 5px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  color: #444;\n  border-radius: 2px;\n  transition: background .15s, color .15s;\n}\n.ai-assistant-btn:hover { background: #e6e6e6; color: #06c; }\n.ai-assistant-btn svg { width: 18px; height: 18px; display: block; }\n\n.ai-assistant-panel {\n  position: fixed;\n  z-index: 99999;\n  min-width: 280px;\n  max-width: 320px;\n  background: #fff;\n  border-radius: 10px;\n  box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);\n  padding: 6px 0;\n  animation: aiPanelIn .15s ease-out;\n  transform-origin: top left;\n}\n@keyframes aiPanelIn {\n  from { opacity: 0; transform: scale(.95) translateY(-4px); }\n  to   { opacity: 1; transform: scale(1) translateY(0); }\n}\n\n.ai-assistant-panel-header {\n  padding: 10px 14px 6px;\n  font-size: 11px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .6px;\n  color: #888;\n}\n\n.ai-assistant-group-label {\n  padding: 10px 14px 4px;\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .8px;\n  color: #aaa;\n  cursor: default;\n}\n\n.ai-assistant-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 14px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font-family: inherit;\n  transition: background .1s;\n}\n.ai-assistant-item:hover { background: #f0f4ff; }\n.ai-assistant-item:active { background: #dde8ff; }\n\n.ai-assistant-item-icon {\n  flex-shrink: 0;\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px;\n  background: #f4f6f8;\n  font-size: 16px;\n}\n.ai-assistant-item:hover .ai-assistant-item-icon {\n  background: #e4ecff;\n}\n\n.ai-assistant-item-text {\n  flex: 1;\n  min-width: 0;\n}\n.ai-assistant-item-label {\n  font-size: 13px;\n  font-weight: 500;\n  color: #1a1a1a;\n  line-height: 1.3;\n}\n.ai-assistant-item-desc {\n  font-size: 11px;\n  color: #888;\n  line-height: 1.3;\n  margin-top: 1px;\n}\n\n.ai-assistant-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99998;\n}\n\n@keyframes aiSpinnerRotate {\n  to { transform: rotate(360deg); }\n}\n\n.ai-assistant-loading {\n  position: fixed;\n  inset: 0;\n  z-index: 100001;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255,255,255,.7);\n}\n.ai-assistant-loading-spinner {\n  width: 36px;\n  height: 36px;\n  border: 4px solid #e0e0e0;\n  border-top-color: #06c;\n  border-radius: 50%;\n  animation: aiSpinnerRotate .7s linear infinite;\n}\n\n.ai-assistant-submenu {\n  position: fixed;\n  z-index: 100000;\n  min-width: 200px;\n  background: #fff;\n  border-radius: 10px;\n  box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);\n  padding: 6px 0;\n  animation: aiPanelIn .12s ease-out;\n}\n.ai-assistant-submenu-title {\n  padding: 8px 14px 2px;\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .8px;\n  color: #aaa;\n}\n.ai-assistant-submenu-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 14px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font-family: inherit;\n  font-size: 13px;\n  color: #1a1a1a;\n  transition: background .1s;\n}\n.ai-assistant-submenu-item:hover { background: #f0f4ff; }\n.ai-assistant-submenu-item:active { background: #dde8ff; }\n\n.ai-assistant-modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 99998;\n  background: rgba(0,0,0,.25);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: aiFadeIn .15s ease-out;\n}\n@keyframes aiFadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.ai-assistant-modal {\n  background: #fff;\n  border-radius: 12px;\n  padding: 24px;\n  width: 620px;\n  max-width: 94vw;\n  max-height: 88vh;\n  overflow-y: auto;\n  box-shadow: 0 12px 48px rgba(0,0,0,.2);\n  animation: aiPanelIn .15s ease-out;\n  box-sizing: border-box;\n}\n@media (max-width: 680px) {\n  .ai-assistant-modal {\n    width: 96vw;\n    padding: 16px;\n    border-radius: 8px;\n  }\n}\n.ai-assistant-modal h3 {\n  margin: 0 0 4px;\n  font-size: 16px;\n  font-weight: 600;\n  color: #1a1a1a;\n}\n.ai-assistant-modal p {\n  margin: 0 0 16px;\n  font-size: 13px;\n  color: #888;\n}\n.ai-assistant-review-original {\n  background: #f7f8fa;\n  border-radius: 6px;\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #888;\n  margin-bottom: 12px;\n  max-height: 160px;\n  overflow-y: auto;\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n.ai-assistant-modal textarea {\n  width: 100%;\n  min-height: 200px;\n  padding: 10px 12px;\n  border: 1px solid #d9d9d9;\n  border-radius: 8px;\n  font-size: 14px;\n  font-family: inherit;\n  resize: vertical;\n  box-sizing: border-box;\n  transition: border-color .15s;\n  outline: none;\n}\n.ai-assistant-modal textarea:focus {\n  border-color: #06c;\n  box-shadow: 0 0 0 2px rgba(0,102,204,.12);\n}\n.ai-assistant-modal-actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  margin-top: 14px;\n}\n.ai-assistant-btn-secondary {\n  padding: 7px 18px;\n  border: 1px solid #d9d9d9;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font-size: 13px;\n  font-family: inherit;\n  color: #555;\n  transition: background .15s, border-color .15s;\n}\n.ai-assistant-btn-secondary:hover {\n  background: #f5f5f5;\n  border-color: #bbb;\n}\n.ai-assistant-btn-primary {\n  padding: 7px 18px;\n  border: none;\n  border-radius: 8px;\n  background: #06c;\n  color: #fff;\n  cursor: pointer;\n  font-size: 13px;\n  font-family: inherit;\n  font-weight: 500;\n  transition: background .15s;\n}\n.ai-assistant-btn-primary:hover { background: #0052a3; }\n  ".trim();
  document.head.appendChild(style);
}
export class AiAssistantModule {
  constructor(quill, options) {
    this.quill = void 0;
    this.aiManager = void 0;
    this.featureInstances = [];
    this.button = null;
    this.panel = null;
    this.backdrop = null;
    this.loadingEl = null;
    this.quill = quill;
    this.aiManager = options.aiManager;
    injectStyles();
    this.initializeFeatures(options);
    this.addToolbarButton();
    this.aiManager.onLoadingChange(loading => {
      if (loading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });
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
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-assistant-wrapper';
    this.button = document.createElement('button');
    this.button.className = 'ql-ai-assistant ai-assistant-btn';
    this.button.innerHTML = "\n      <svg viewBox=\"0 0 18 18\">\n        <path d=\"M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z\"\n              class=\"ql-fill\" fill=\"currentColor\"/>\n      </svg>\n    ";
    this.button.setAttribute('aria-label', 'AI Assistant');
    this.button.title = 'AI Assistant';
    this.button.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      this.togglePanel();
    });
    wrapper.appendChild(this.button);
    const lastButton = toolbar.container.querySelector('.ql-ai-assistant');
    if (lastButton) {
      toolbar.container.insertBefore(wrapper, lastButton);
    } else {
      toolbar.container.appendChild(wrapper);
    }
  }
  togglePanel() {
    if (this.panel) {
      this.closePanel();
      return;
    }
    this.showPanel();
  }
  showPanel() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ai-assistant-backdrop';
    this.backdrop.addEventListener('click', () => this.closePanel());
    this.backdrop.addEventListener('contextmenu', e => e.preventDefault());
    document.body.appendChild(this.backdrop);
    this.panel = document.createElement('div');
    this.panel.className = 'ai-assistant-panel';
    const header = document.createElement('div');
    header.className = 'ai-assistant-panel-header';
    header.textContent = 'AI Assistant';
    this.panel.appendChild(header);
    const grouped = this.groupFeatures();
    grouped.forEach((group, gi) => {
      if (gi > 0) {
        const divider = document.createElement('div');
        divider.style.cssText = 'height:1px;background:#eee;margin:4px 12px;';
        this.panel.appendChild(divider);
      }
      const groupLabel = document.createElement('div');
      groupLabel.className = 'ai-assistant-group-label';
      groupLabel.textContent = group.label;
      this.panel.appendChild(groupLabel);
      group.items.forEach(_ref2 => {
        let {
          feature,
          instance
        } = _ref2;
        const item = document.createElement('button');
        item.className = 'ai-assistant-item';
        const meta = FEATURE_META[feature.name];
        const icon = document.createElement('span');
        icon.className = 'ai-assistant-item-icon';
        icon.textContent = (meta == null ? void 0 : meta.icon) || '\u2728';
        const text = document.createElement('span');
        text.className = 'ai-assistant-item-text';
        const label = document.createElement('div');
        label.className = 'ai-assistant-item-label';
        label.textContent = instance.label;
        const desc = document.createElement('div');
        desc.className = 'ai-assistant-item-desc';
        desc.textContent = (meta == null ? void 0 : meta.desc) || '';
        text.appendChild(label);
        text.appendChild(desc);
        item.appendChild(icon);
        item.appendChild(text);
        item.addEventListener('click', e => {
          e.stopPropagation();
          this.closePanel();
          instance.trigger();
        });
        this.panel.appendChild(item);
      });
    });
    document.body.appendChild(this.panel);
    this.positionPanel();
  }
  groupFeatures() {
    const groups = {
      edit: [],
      create: [],
      analyze: []
    };
    this.featureInstances.forEach(instance => {
      const meta = FEATURE_META[instance.name];
      const group = (meta == null ? void 0 : meta.group) || 'analyze';
      if (groups[group]) {
        groups[group].push({
          feature: instance,
          instance
        });
      }
    });
    const result = [];
    Object.entries(groups).forEach(_ref3 => {
      let [key, items] = _ref3;
      if (items.length > 0) {
        result.push({
          label: GROUP_LABELS[key] || key,
          items
        });
      }
    });
    return result;
  }
  positionPanel() {
    if (!this.panel || !this.button) return;
    const btnRect = this.button.getBoundingClientRect();
    const panelWidth = this.panel.offsetWidth;
    const panelHeight = this.panel.offsetHeight;
    let left = btnRect.left;
    let top = btnRect.bottom + 4;
    if (left + panelWidth > window.innerWidth - 8) {
      left = window.innerWidth - panelWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }
    if (top + panelHeight > window.innerHeight - 8) {
      top = btnRect.top - panelHeight - 4;
    }
    if (top < 8) {
      top = 8;
    }
    this.panel.style.left = left + "px";
    this.panel.style.top = top + "px";
  }
  showLoading() {
    if (this.loadingEl) return;
    const el = document.createElement('div');
    el.className = 'ai-assistant-loading';
    const spinner = document.createElement('div');
    spinner.className = 'ai-assistant-loading-spinner';
    el.appendChild(spinner);
    document.body.appendChild(el);
    this.loadingEl = el;
  }
  hideLoading() {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
  }
  closePanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
  }
}