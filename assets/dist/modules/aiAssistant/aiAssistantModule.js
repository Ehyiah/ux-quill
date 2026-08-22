import { RewriteFeature } from "./features/rewriteFeature.js";
import { TranslateFeature } from "./features/translateFeature.js";
import { GrammarFeature } from "./features/grammarFeature.js";
import { GenerateFeature } from "./features/generateFeature.js";
import { SummarizeFeature } from "./features/summarizeFeature.js";
import { TocFeature } from "./features/tocFeature.js";
import { SynonymFeature } from "./features/synonymFeature.js";
const PANEL_ID = 'ai-assistant-panel';
const FEATURE_ICONS = {
  rewrite: '\u270D\uFE0F',
  translate: '\uD83C\uDF10',
  grammar: '\u2714\uFE0F',
  summarize: '\uD83D\uDCDD',
  generate: '\u2728',
  toc: '\uD83D\uDCD1',
  synonym: '\uD83D\uDD04'
};
const FEATURE_GROUPS = {
  rewrite: 'edit',
  translate: 'edit',
  grammar: 'edit',
  summarize: 'create',
  generate: 'create',
  toc: 'analyze',
  synonym: 'edit'
};
const GROUP_LABEL_KEYS = {
  edit: 'groupEdit',
  create: 'groupCreate',
  analyze: 'groupAnalyze'
};
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = "\n.ai-assistant-wrapper {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.ai-assistant-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 24px;\n  padding: 3px 5px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  color: #444;\n  border-radius: 2px;\n  transition: background .15s, color .15s;\n}\n.ai-assistant-btn:hover { background: #e6e6e6; color: #06c; }\ndiv.ai-assistant-wrapper .ai-assistant-btn svg { width: 18px; height: 18px; display: block; float: none; }\n\n.ai-assistant-panel {\n  position: fixed;\n  z-index: 99999;\n  width: 320px;\n  max-width: calc(100vw - 24px);\n  background: #fff;\n  border: 1px solid #e5e9f2;\n  border-radius: 14px;\n  box-shadow: 0 18px 48px rgba(30, 41, 70, .16), 0 3px 10px rgba(30, 41, 70, .08);\n  padding: 8px;\n  animation: aiPanelIn .18s ease-out;\n  transform-origin: top left;\n}\n@keyframes aiPanelIn {\n  from { opacity: 0; transform: scale(.95) translateY(-4px); }\n  to   { opacity: 1; transform: scale(1) translateY(0); }\n}\n\n.ai-assistant-panel-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 8px 12px;\n  border-bottom: 1px solid #eef1f6;\n  color: #19233d;\n}\n.ai-assistant-panel-mark {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  flex: 0 0 32px;\n  border-radius: 10px;\n  background: linear-gradient(135deg, #e8edff, #f2eaff);\n  color: #5965d8;\n  font-size: 18px;\n  line-height: 1;\n}\n.ai-assistant-panel-title {\n  font-size: 14px;\n  font-weight: 700;\n  letter-spacing: -.01em;\n}\n\n.ai-assistant-divider {\n  height: 1px;\n  background: #eef1f6;\n  margin: 6px 8px;\n}\n\n.ai-assistant-group-label {\n  padding: 14px 8px 6px;\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n  color: #9aa3b6;\n  cursor: default;\n}\n\n.ai-assistant-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 9px 8px;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font-family: inherit;\n  transition: background .15s, border-color .15s, transform .15s;\n}\n.ai-assistant-item:hover { background: #f6f7ff; border-color: #e4e7fb; }\n.ai-assistant-item:active { background: #edf0ff; transform: scale(.99); }\n.ai-assistant-item:focus-visible,\n.ai-assistant-submenu-item:focus-visible {\n  outline: 3px solid rgba(89, 101, 216, .24);\n  outline-offset: 1px;\n}\n\n.ai-assistant-item-icon {\n  flex-shrink: 0;\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 10px;\n  background: #f1f3f8;\n  font-size: 16px;\n  transition: background .15s, transform .15s;\n}\n.ai-assistant-item:hover .ai-assistant-item-icon {\n  background: #e6e9ff;\n  transform: translateY(-1px);\n}\n\n.ai-assistant-item-text {\n  flex: 1;\n  min-width: 0;\n}\n.ai-assistant-item-label {\n  font-size: 13px;\n  font-weight: 500;\n  color: #1a1a1a;\n  line-height: 1.3;\n}\n.ai-assistant-item-desc {\n  font-size: 11px;\n  color: #888;\n  line-height: 1.3;\n  margin-top: 1px;\n}\n\n.ai-assistant-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99998;\n}\n\n@keyframes aiSpinnerRotate {\n  to { transform: rotate(360deg); }\n}\n\n.ai-assistant-loading {\n  position: fixed;\n  inset: 0;\n  z-index: 100001;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(20, 27, 48, .38);\n  backdrop-filter: blur(4px);\n  animation: aiFadeIn .15s ease-out;\n}\n.ai-assistant-loading-card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 14px;\n  padding: 26px 34px;\n  background: #fff;\n  border: 1px solid #e5e9f2;\n  border-radius: 16px;\n  box-shadow: 0 24px 64px rgba(25,35,61,.22);\n  animation: aiPanelIn .18s ease-out;\n}\n.ai-assistant-loading-spinner {\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: conic-gradient(from 0deg, #5965d8, #9a6ee0 55%, #e8edff 80%, transparent);\n  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));\n          mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));\n  animation: aiSpinnerRotate .9s linear infinite;\n}\n.ai-assistant-loading-text {\n  display: flex;\n  align-items: baseline;\n  color: #40495f;\n  font-size: 14px;\n  font-weight: 500;\n}\n.ai-assistant-loading-dots {\n  display: inline-flex;\n  margin-left: 6px;\n}\n.ai-assistant-loading-dots i {\n  width: 4px;\n  height: 4px;\n  margin-left: 3px;\n  border-radius: 50%;\n  background: #5965d8;\n  animation: aiDotPulse 1s ease-in-out infinite;\n}\n.ai-assistant-loading-dots i:nth-child(2) { animation-delay: .15s; }\n.ai-assistant-loading-dots i:nth-child(3) { animation-delay: .3s; }\n@keyframes aiDotPulse {\n  0%, 100% { opacity: .25; transform: translateY(0); }\n  50%      { opacity: 1;   transform: translateY(-2px); }\n}\n\n.ai-assistant-error {\n  position: fixed;\n  top: 16px;\n  right: 16px;\n  z-index: 100002;\n  max-width: min(420px, calc(100vw - 32px));\n  padding: 12px 16px;\n  border: 1px solid #f0b8b8;\n  border-radius: 8px;\n  background: #fff5f5;\n  box-shadow: 0 8px 24px rgba(0,0,0,.15);\n  color: #9b1c1c;\n  font-size: 13px;\n  line-height: 1.4;\n}\n\n.ai-assistant-submenu {\n  position: fixed;\n  z-index: 100000;\n  width: 248px;\n  max-width: calc(100vw - 24px);\n  background: #fff;\n  border: 1px solid #e5e9f2;\n  border-radius: 14px;\n  box-shadow: 0 18px 48px rgba(30, 41, 70, .16), 0 3px 10px rgba(30, 41, 70, .08);\n  padding: 8px;\n  animation: aiPanelIn .16s ease-out;\n}\n.ai-assistant-submenu-title {\n  padding: 7px 8px 10px;\n  border-bottom: 1px solid #eef1f6;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: .01em;\n  color: #58627a;\n}\n.ai-assistant-submenu-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 9px 8px;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: none;\n  cursor: pointer;\n  text-align: left;\n  font-family: inherit;\n  font-size: 13px;\n  color: #1a1a1a;\n  transition: background .15s, border-color .15s;\n}\n.ai-assistant-submenu-item:hover { background: #f6f7ff; border-color: #e4e7fb; }\n.ai-assistant-submenu-item:active { background: #edf0ff; }\n.ai-assistant-submenu-copy {\n  flex: 1;\n  min-width: 0;\n}\n.ai-assistant-submenu-label {\n  display: block;\n  color: #202942;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 1.3;\n}\n.ai-assistant-submenu-description {\n  display: block;\n  margin-top: 2px;\n  color: #8a93a8;\n  font-size: 11px;\n  line-height: 1.3;\n}\n.ai-assistant-submenu-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  flex: 0 0 28px;\n  border-radius: 8px;\n  background: #f1f3f8;\n  font-size: 15px;\n  line-height: 1;\n}\n\n.ai-assistant-modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 99998;\n  background: rgba(20, 27, 48, .38);\n  backdrop-filter: blur(3px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: aiFadeIn .15s ease-out;\n}\n@keyframes aiFadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.ai-assistant-modal {\n  background: #fff;\n  border: 1px solid #e5e9f2;\n  border-radius: 16px;\n  padding: 26px;\n  width: 620px;\n  max-width: 94vw;\n  max-height: 88vh;\n  overflow-y: auto;\n  box-shadow: 0 24px 64px rgba(25, 35, 61, .22);\n  animation: aiPanelIn .15s ease-out;\n  box-sizing: border-box;\n}\n@media (max-width: 680px) {\n  .ai-assistant-modal {\n    width: 96vw;\n    padding: 16px;\n    border-radius: 8px;\n  }\n}\n.ai-assistant-modal h3 {\n  margin: 0 0 4px;\n  font-size: 16px;\n  font-weight: 600;\n  color: #1a1a1a;\n}\n.ai-assistant-modal p {\n  margin: 0 0 16px;\n  font-size: 13px;\n  color: #888;\n}\n.ai-assistant-review-original {\n  background: #f7f8fa;\n  border-radius: 6px;\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #888;\n  margin-bottom: 12px;\n  max-height: 160px;\n  overflow-y: auto;\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n.ai-assistant-modal textarea {\n  width: 100%;\n  min-height: 200px;\n  padding: 10px 12px;\n  border: 1px solid #d9d9d9;\n  border-radius: 8px;\n  font-size: 14px;\n  font-family: inherit;\n  resize: vertical;\n  box-sizing: border-box;\n  transition: border-color .15s;\n  outline: none;\n}\n.ai-assistant-modal textarea:focus {\n  border-color: #06c;\n  box-shadow: 0 0 0 2px rgba(0,102,204,.12);\n}\n.ai-assistant-modal-actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  margin-top: 14px;\n}\n.ai-assistant-btn-secondary {\n  padding: 7px 18px;\n  border: 1px solid #d9d9d9;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font-size: 13px;\n  font-family: inherit;\n  color: #555;\n  transition: background .15s, border-color .15s;\n}\n.ai-assistant-btn-secondary:hover {\n  background: #f5f5f5;\n  border-color: #bbb;\n}\n.ai-assistant-modal-actions button:disabled {\n  opacity: .55;\n  cursor: default;\n}\n.ai-assistant-btn-regenerate {\n  margin-right: auto;\n}\n.ai-assistant-btn-regenerate.ai-assistant-btn-loading::before {\n  content: '';\n  display: inline-block;\n  width: 12px;\n  height: 12px;\n  margin-right: 6px;\n  border: 2px solid #cbd2e0;\n  border-top-color: #5965d8;\n  border-radius: 50%;\n  vertical-align: -2px;\n  animation: aiSpinnerRotate .7s linear infinite;\n}\n.ai-assistant-btn-primary {\n  padding: 7px 18px;\n  border: none;\n  border-radius: 8px;\n  background: #06c;\n  color: #fff;\n  cursor: pointer;\n  font-size: 13px;\n  font-family: inherit;\n  font-weight: 500;\n  transition: background .15s;\n}\n.ai-assistant-btn-primary:hover { background: #0052a3; }\n  ".trim();
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
    this.errorEl = null;
    this.panelSelection = null;
    this.panelAnchorRect = void 0;
    this.panelKeydownHandler = null;
    this.quill = quill;
    this.aiManager = options.aiManager;
    injectStyles();
    this.initializeFeatures(options);
    this.addToolbarButton();
    const keyboardShortcut = options.keyboardShortcut !== undefined ? options.keyboardShortcut : {
      key: 'Space',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false
    };
    this.bindKeyboardShortcut(keyboardShortcut);
    this.aiManager.onLoadingChange(loading => {
      if (loading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });
    this.aiManager.onDownloadProgress(progress => {
      const el = this.loadingEl;
      if (!el) return;
      const textEl = el.querySelector('.ai-assistant-loading-label');
      if (textEl) {
        textEl.textContent = progress < 100 ? this.aiManager.getLabels().loadingModel + " " + progress + "%" : this.aiManager.getLabels().preparing;
      }
    });
    this.aiManager.onError(error => this.showError(error));
  }
  initializeFeatures(options) {
    const features = options.features || {};
    const featureMap = {
      rewrite: RewriteFeature,
      translate: TranslateFeature,
      grammar: GrammarFeature,
      generate: GenerateFeature,
      summarize: SummarizeFeature,
      toc: TocFeature,
      synonym: SynonymFeature
    };
    Object.entries(features).forEach(_ref => {
      let [key, config] = _ref;
      const FeatureClass = featureMap[key];
      if (FeatureClass) {
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
    this.button.type = 'button';
    this.button.setAttribute('aria-label', 'AI Assistant');
    this.button.title = 'AI Assistant';
    this.button.setAttribute('aria-controls', PANEL_ID);
    this.button.setAttribute('aria-expanded', 'false');
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
  bindKeyboardShortcut(shortcut) {
    if (!shortcut) return;
    const key = shortcut.key === 'Space' ? ' ' : shortcut.key;
    const expectCtrl = !!shortcut.ctrlKey;
    const expectShift = !!shortcut.shiftKey;
    const expectAlt = !!shortcut.altKey;
    const expectMeta = !!shortcut.metaKey;
    this.quill.root.addEventListener('keydown', event => {
      if (event.key !== key) return;
      if (event.ctrlKey !== expectCtrl) return;
      if (event.shiftKey !== expectShift) return;
      if (event.altKey !== expectAlt) return;
      if (event.metaKey !== expectMeta) return;
      event.preventDefault();
      event.stopPropagation();
      this.openPanel(this.getSelectionAnchorRect());
    });
  }
  getSelectionAnchorRect() {
    const selection = this.quill.getSelection();
    if (!selection) return undefined;
    const bounds = this.quill.getBounds(selection.index, selection.length);
    if (!bounds) return undefined;
    const containerRect = this.quill.container.getBoundingClientRect();
    return {
      left: containerRect.left + bounds.left,
      top: containerRect.top + bounds.top,
      bottom: containerRect.top + bounds.top + bounds.height,
      right: containerRect.left + bounds.left + bounds.width,
      width: bounds.width,
      height: bounds.height,
      x: containerRect.left + bounds.left,
      y: containerRect.top + bounds.top,
      toJSON: () => ({})
    };
  }
  togglePanel() {
    if (this.panel) {
      this.closePanel();
      return;
    }
    this.openPanel();
  }
  openPanel(anchorRect) {
    var _this$button;
    this.panelAnchorRect = anchorRect;
    this.showPanel();
    (_this$button = this.button) == null || _this$button.setAttribute('aria-expanded', 'true');
  }
  showPanel() {
    this.panelSelection = this.quill.getSelection() || null;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ai-assistant-backdrop';
    this.backdrop.addEventListener('click', () => this.closePanel());
    this.backdrop.addEventListener('contextmenu', e => e.preventDefault());
    document.body.appendChild(this.backdrop);
    this.panel = document.createElement('div');
    this.panel.className = 'ai-assistant-panel';
    this.panel.id = PANEL_ID;
    this.panelKeydownHandler = event => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.closePanel();
      }
    };
    document.addEventListener('keydown', this.panelKeydownHandler);
    const labels = this.aiManager.getLabels();
    const header = document.createElement('div');
    header.className = 'ai-assistant-panel-header';
    const mark = document.createElement('span');
    mark.className = 'ai-assistant-panel-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '\u2728';
    const title = document.createElement('span');
    title.className = 'ai-assistant-panel-title';
    title.textContent = labels.panelTitle || 'AI Assistant';
    header.appendChild(mark);
    header.appendChild(title);
    this.panel.appendChild(header);
    const grouped = this.groupFeatures();
    grouped.forEach((group, gi) => {
      if (gi > 0) {
        const divider = document.createElement('div');
        divider.className = 'ai-assistant-divider';
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
        item.type = 'button';
        item.className = 'ai-assistant-item';
        const icon = document.createElement('span');
        icon.className = 'ai-assistant-item-icon';
        icon.textContent = FEATURE_ICONS[feature.name] || '\u2728';
        const text = document.createElement('span');
        text.className = 'ai-assistant-item-text';
        const label = document.createElement('div');
        label.className = 'ai-assistant-item-label';
        label.textContent = instance.label;
        const labels = this.aiManager.getLabels();
        const descMap = {
          rewrite: labels.descRewrite,
          translate: labels.descTranslate,
          grammar: labels.descGrammar,
          generate: labels.descGenerate,
          summarize: labels.descSummarize,
          toc: labels.descToc,
          synonym: labels.descSynonym
        };
        const desc = document.createElement('div');
        desc.className = 'ai-assistant-item-desc';
        desc.textContent = descMap[feature.name] || '';
        text.appendChild(label);
        text.appendChild(desc);
        item.appendChild(icon);
        item.appendChild(text);
        item.addEventListener('mousedown', e => {
          var _this$button2;
          e.preventDefault();
          const btnRect = (_this$button2 = this.button) == null ? void 0 : _this$button2.getBoundingClientRect();
          this.closePanel();
          if (this.panelSelection) {
            this.quill.setSelection(this.panelSelection.index, this.panelSelection.length, 'api');
          }
          instance.trigger(btnRect);
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
      const group = FEATURE_GROUPS[instance.name] || 'analyze';
      if (groups[group]) {
        groups[group].push({
          feature: instance,
          instance
        });
      }
    });
    const labels = this.aiManager.getLabels();
    const result = [];
    Object.entries(groups).forEach(_ref3 => {
      let [key, items] = _ref3;
      if (items.length > 0) {
        const labelKey = GROUP_LABEL_KEYS[key];
        result.push({
          label: (labelKey ? labels[labelKey] : '') || key,
          items
        });
      }
    });
    return result;
  }
  positionPanel() {
    var _this$button3;
    if (!this.panel) return;
    const btnRect = this.panelAnchorRect || ((_this$button3 = this.button) == null ? void 0 : _this$button3.getBoundingClientRect());
    if (!btnRect) return;
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
    el.setAttribute('role', 'status');
    const card = document.createElement('div');
    card.className = 'ai-assistant-loading-card';
    const spinner = document.createElement('div');
    spinner.className = 'ai-assistant-loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const text = document.createElement('div');
    text.className = 'ai-assistant-loading-text';
    const label = document.createElement('span');
    label.className = 'ai-assistant-loading-label';
    label.textContent = this.aiManager.getLabels().generating || '';
    text.appendChild(label);
    const dots = document.createElement('span');
    dots.className = 'ai-assistant-loading-dots';
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 3; i++) {
      dots.appendChild(document.createElement('i'));
    }
    text.appendChild(dots);
    card.appendChild(spinner);
    card.appendChild(text);
    el.appendChild(card);
    document.body.appendChild(el);
    this.loadingEl = el;
  }
  hideLoading() {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
  }
  showError(error) {
    var _this$errorEl;
    (_this$errorEl = this.errorEl) == null || _this$errorEl.remove();
    const errorEl = document.createElement('div');
    errorEl.className = 'ai-assistant-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = error.message;
    document.body.appendChild(errorEl);
    this.errorEl = errorEl;
    window.setTimeout(() => {
      if (this.errorEl === errorEl) {
        errorEl.remove();
        this.errorEl = null;
      }
    }, 6000);
  }
  closePanel() {
    var _this$button4;
    this.panelSelection = null;
    this.panelAnchorRect = undefined;
    if (this.panelKeydownHandler) {
      document.removeEventListener('keydown', this.panelKeydownHandler);
      this.panelKeydownHandler = null;
    }
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    (_this$button4 = this.button) == null || _this$button4.setAttribute('aria-expanded', 'false');
  }
}