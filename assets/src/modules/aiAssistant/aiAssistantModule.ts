import type Quill from 'quill';
import { AiManager } from './aiManager.js';
import type { AiFeature, AiFeatureInterface } from './aiTypes.js';
import { RewriteFeature } from './features/rewriteFeature.js';
import { TranslateFeature } from './features/translateFeature.js';
import { GrammarFeature } from './features/grammarFeature.js';
import { GenerateFeature } from './features/generateFeature.js';
import { SummarizeFeature } from './features/summarizeFeature.js';
import { TocFeature } from './features/tocFeature.js';
import { SynonymFeature } from './features/synonymFeature.js';
import { dismissAiSubmenu } from './utils/submenu.js';

interface AiAssistantOptions {
  aiManager: AiManager;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
  keyboardShortcut?: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } | false;
}

const PANEL_ID = 'ai-assistant-panel';

const featureIcon = (paths: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const FEATURE_ICONS: Record<AiFeature, string> = {
  rewrite: featureIcon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>'),
  translate: featureIcon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'),
  grammar: featureIcon('<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'),
  summarize: featureIcon('<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4M10 12h6M10 16h6"/>'),
  generate: featureIcon('<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/>'),
  toc: featureIcon('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r=".7"/><circle cx="4" cy="12" r=".7"/><circle cx="4" cy="18" r=".7"/>'),
  synonym: featureIcon('<path d="m16 3 4 4-4 4M20 7H4m4 14-4-4 4-4m-4 4h16"/>'),
};

const FEATURE_GROUPS: Record<AiFeature, 'edit' | 'create' | 'analyze'> = {
  rewrite: 'edit',
  translate: 'edit',
  grammar: 'edit',
  summarize: 'analyze',
  generate: 'create',
  toc: 'analyze',
  synonym: 'edit',
};

const GROUP_LABEL_KEYS: Record<string, keyof AiLabelFallbacks> = {
  edit: 'groupEdit',
  create: 'groupCreate',
  analyze: 'groupAnalyze',
};

type AiLabelFallbacks = {
  panelTitle: string;
  groupEdit: string;
  groupCreate: string;
  groupAnalyze: string;
};

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
.ai-assistant-wrapper {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.ai-assistant-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  padding: 3px 5px;
  border: none;
  background: none;
  cursor: pointer;
  color: #444;
  border-radius: 2px;
  transition: background .15s, color .15s;
}
.ai-assistant-btn:hover { background: #e6e6e6; color: #06c; }
div.ai-assistant-wrapper .ai-assistant-btn svg { width: 18px; height: 18px; display: block; float: none; }

.ai-assistant-panel {
  position: fixed;
  z-index: 99999;
  width: 352px;
  max-width: calc(100vw - 20px);
  max-height: min(520px, calc(100vh - 20px));
  overflow-y: auto;
  overscroll-behavior: contain;
  box-sizing: border-box;
  padding: 10px;
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 18px;
  box-shadow: 0 20px 56px rgba(30, 41, 70, .18), 0 4px 14px rgba(30, 41, 70, .08);
  animation: aiPanelIn .18s ease-out;
  transform-origin: top left;
}
.ai-assistant-panel::-webkit-scrollbar { width: 6px; }
.ai-assistant-panel::-webkit-scrollbar-thumb { background: #dce1ed; border-radius: 6px; }
@keyframes aiPanelIn {
  from { opacity: 0; transform: scale(.97) translateY(-5px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ai-assistant-panel-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 9px 14px;
  border-bottom: 1px solid #edf0f6;
  color: #19233d;
}
.ai-assistant-panel-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border: 1px solid rgba(89, 101, 216, .08);
  border-radius: 12px;
  background: linear-gradient(135deg, #e8edff, #f3ebff);
  color: #5965d8;
}
.ai-assistant-panel-mark svg { width: 20px; height: 20px; }
.ai-assistant-panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -.01em;
}

.ai-assistant-divider {
  height: 1px;
  background: #edf0f6;
  margin: 7px 9px 1px;
}

.ai-assistant-group-label {
  padding: 12px 9px 5px;
  color: #818ba1;
  cursor: default;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .09em;
}

.ai-assistant-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 54px;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background .16s ease, border-color .16s ease, transform .16s ease;
}
.ai-assistant-item:hover { background: #f7f8ff; border-color: #e7e9fb; }
.ai-assistant-item:active { background: #eef0ff; transform: scale(.99); }
.ai-assistant-item:focus-visible {
  outline: 2px solid #717be0;
  outline-offset: 1px;
}

.ai-assistant-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  transition: transform .16s ease;
}
.ai-assistant-item-icon svg { width: 19px; height: 19px; }
.ai-assistant-item:hover .ai-assistant-item-icon { transform: translateY(-1px); }
.ai-assistant-icon-rewrite { color: #7354c8; background: #f2edff; }
.ai-assistant-icon-translate { color: #3276bd; background: #eaf3ff; }
.ai-assistant-icon-grammar { color: #25835b; background: #eaf7ef; }
.ai-assistant-icon-summarize { color: #a36c1c; background: #fff4e5; }
.ai-assistant-icon-generate { color: #6757ce; background: #f0edff; }
.ai-assistant-icon-toc { color: #27818a; background: #e8f7f7; }
.ai-assistant-icon-synonym { color: #b04e75; background: #fff0f5; }

.ai-assistant-item-text {
  flex: 1;
  min-width: 0;
}
.ai-assistant-item-label {
  color: #202942;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}
.ai-assistant-item-desc {
  margin-top: 2px;
  color: #737e93;
  font-size: 11px;
  line-height: 1.35;
}
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-panel, .ai-assistant-item, .ai-assistant-item-icon {
    animation: none !important;
    transition: none !important;
  }
}

.ai-assistant-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
}

@keyframes aiSpinnerRotate {
  to { transform: rotate(360deg); }
}

.ai-assistant-loading {
  position: fixed;
  inset: 0;
  z-index: 100001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 27, 48, .38);
  backdrop-filter: blur(4px);
  animation: aiFadeIn .15s ease-out;
}
.ai-assistant-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 26px 34px;
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(25,35,61,.22);
  animation: aiPanelIn .18s ease-out;
}
.ai-assistant-loading-spinner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #5965d8, #9a6ee0 55%, #e8edff 80%, transparent);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px));
  animation: aiSpinnerRotate .9s linear infinite;
}
.ai-assistant-loading-text {
  display: flex;
  align-items: baseline;
  color: #40495f;
  font-size: 14px;
  font-weight: 500;
}
.ai-assistant-loading-dots {
  display: inline-flex;
  margin-left: 6px;
}
.ai-assistant-loading-dots i {
  width: 4px;
  height: 4px;
  margin-left: 3px;
  border-radius: 50%;
  background: #5965d8;
  animation: aiDotPulse 1s ease-in-out infinite;
}
.ai-assistant-loading-dots i:nth-child(2) { animation-delay: .15s; }
.ai-assistant-loading-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes aiDotPulse {
  0%, 100% { opacity: .25; transform: translateY(0); }
  50%      { opacity: 1;   transform: translateY(-2px); }
}

.ai-assistant-error {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100002;
  max-width: min(420px, calc(100vw - 32px));
  padding: 12px 16px;
  border: 1px solid #f0b8b8;
  border-radius: 8px;
  background: #fff5f5;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  color: #9b1c1c;
  font-size: 13px;
  line-height: 1.4;
}
.ai-assistant-notice {
  position: fixed;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  transform: translate(-50%, -50%);
  z-index: 100002;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(440px, calc(100vw - 32px));
  padding: 12px 16px;
  border: 1px solid #dce3f4;
  border-radius: 12px;
  background: #f7f8ff;
  box-shadow: 0 12px 32px rgba(30, 41, 70, .14);
  color: #394765;
  font-size: 13px;
  line-height: 1.45;
  animation: aiFadeIn .15s ease-out;
}
.ai-assistant-notice-message {
  flex: 1;
}
.ai-assistant-notice-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  margin: -4px -8px -4px 0;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #69758e;
  cursor: pointer;
  font: inherit;
  font-size: 20px;
  line-height: 1;
  transition: background .15s ease, color .15s ease;
}
.ai-assistant-notice-close:hover { background: #e9edfb; color: #394765; }
.ai-assistant-notice-close:focus-visible { outline: 2px solid #717be0; outline-offset: 1px; }
.ai-assistant-notice::before {
  content: 'i';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e7ebff;
  color: #5965d8;
  font-size: 12px;
  font-weight: 700;
}
.ai-assistant-submenu {
  position: fixed;
  z-index: 100000;
  box-sizing: border-box;
  width: 320px;
  max-width: calc(100vw - 20px);
  max-height: min(460px, calc(100vh - 20px));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 10px;
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 16px;
  box-shadow: 0 20px 56px rgba(30, 41, 70, .18), 0 4px 14px rgba(30, 41, 70, .08);
  animation: aiPanelIn .18s ease-out;
  transform-origin: top left;
}
.ai-assistant-submenu-title {
  padding: 8px 9px 12px;
  border-bottom: 1px solid #edf0f6;
  color: #19233d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .01em;
}
.ai-assistant-submenu-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 54px;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #202942;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background .16s ease, border-color .16s ease, transform .16s ease;
}
.ai-assistant-submenu-item:hover, .ai-assistant-submenu-item[aria-pressed="true"] { background: #f7f8ff; border-color: #e7e9fb; }
.ai-assistant-submenu-item:active { background: #eef0ff; transform: scale(.99); }
.ai-assistant-submenu-item:focus-visible {
  outline: 2px solid #717be0;
  outline-offset: 1px;
}
.ai-assistant-submenu-copy {
  flex: 1;
  min-width: 0;
}
.ai-assistant-submenu-label {
  display: block;
  color: #202942;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}
.ai-assistant-submenu-description {
  display: block;
  margin-top: 2px;
  color: #737e93;
  font-size: 11px;
  line-height: 1.35;
}
.ai-assistant-submenu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: #f1f3f8;
  color: #5965d8;
  line-height: 1;
  transition: transform .16s ease;
}
.ai-assistant-submenu-icon svg { width: 19px; height: 19px; }
.ai-assistant-submenu-item:hover .ai-assistant-submenu-icon { transform: translateY(-1px); }
.ai-assistant-style-formal { color: #4e6497; background: #edf2ff; }
.ai-assistant-style-casual { color: #25835b; background: #eaf7ef; }
.ai-assistant-style-concise { color: #a36c1c; background: #fff4e5; }
.ai-assistant-style-expanded { color: #7354c8; background: #f2edff; }
.ai-assistant-format-paragraph { color: #3276bd; background: #eaf3ff; }
.ai-assistant-format-bullets { color: #27818a; background: #e8f7f7; }
@media (prefers-reduced-motion: reduce) {
  .ai-assistant-submenu, .ai-assistant-submenu-item, .ai-assistant-submenu-icon {
    animation: none !important;
    transition: none !important;
  }
}

.ai-assistant-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: rgba(20, 27, 48, .38);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: aiFadeIn .15s ease-out;
}
@keyframes aiFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ai-assistant-modal {
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 16px;
  padding: 26px;
  width: 620px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(25, 35, 61, .22);
  animation: aiPanelIn .15s ease-out;
  box-sizing: border-box;
}
@media (max-width: 680px) {
  .ai-assistant-modal {
    width: 96vw;
    padding: 16px;
    border-radius: 8px;
  }
}
.ai-assistant-modal h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.ai-assistant-modal p {
  margin: 0 0 16px;
  font-size: 13px;
  color: #888;
}
.ai-assistant-review-original {
  background: #f7f8fa;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
  max-height: 160px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai-assistant-modal textarea {
  width: 100%;
  min-height: 200px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color .15s;
  outline: none;
}
.ai-assistant-modal textarea:focus {
  border-color: #06c;
  box-shadow: 0 0 0 2px rgba(0,102,204,.12);
}
.ai-assistant-modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 14px;
}
.ai-assistant-btn-secondary {
  padding: 7px 18px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: #555;
  transition: background .15s, border-color .15s;
}
.ai-assistant-btn-secondary:hover {
  background: #f5f5f5;
  border-color: #bbb;
}
.ai-assistant-modal-actions button:disabled {
  opacity: .55;
  cursor: default;
}
.ai-assistant-btn-regenerate {
  margin-right: auto;
}
.ai-assistant-btn-regenerate.ai-assistant-btn-loading::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border: 2px solid #cbd2e0;
  border-top-color: #5965d8;
  border-radius: 50%;
  vertical-align: -2px;
  animation: aiSpinnerRotate .7s linear infinite;
}
.ai-assistant-btn-primary {
  padding: 7px 18px;
  border: none;
  border-radius: 8px;
  background: #06c;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  transition: background .15s;
}
.ai-assistant-btn-primary:hover { background: #0052a3; }
  `.trim();
  document.head.appendChild(style);
}

export class AiAssistantModule {
  private quill: Quill;
  private aiManager: AiManager;
  private featureInstances: AiFeatureInterface[] = [];
  private button: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private loadingEl: HTMLElement | null = null;
  private errorEl: HTMLElement | null = null;
  private panelSelection: { index: number; length: number } | null = null;
  private panelAnchorRect: DOMRect | undefined;
  private panelKeydownHandler: ((event: KeyboardEvent) => void) | null = null;
  private panelPreviousFocus: HTMLElement | null = null;
  private panelTrigger: HTMLElement | null = null;

  constructor(quill: Quill, options: AiAssistantOptions) {
    this.quill = quill;
    this.aiManager = options.aiManager;
    injectStyles();
    this.initializeFeatures(options);
    this.addToolbarButton();
    const keyboardShortcut = options.keyboardShortcut !== undefined
      ? options.keyboardShortcut
      : { key: 'Space', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false };
    this.bindKeyboardShortcut(keyboardShortcut);
    this.aiManager.onLoadingChange((loading) => {
      if (loading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });
    this.aiManager.onDownloadProgress((progress) => {
      const el = this.loadingEl;
      if (!el) return;
      const textEl = el.querySelector('.ai-assistant-loading-label') as HTMLElement | null;
      if (textEl) {
        textEl.textContent = progress < 100
          ? `${this.aiManager.getLabels().loadingModel} ${progress}%`
          : this.aiManager.getLabels().preparing;
      }
    });
    this.aiManager.onError((error) => this.showError(error));
  }

  private initializeFeatures(options: AiAssistantOptions): void {
    const features = options.features || {};
    const featureMap: Record<string, new (quill: unknown, aiManager: AiManager, config?: Record<string, unknown>) => AiFeatureInterface> = {
      rewrite: RewriteFeature,
      translate: TranslateFeature,
      grammar: GrammarFeature,
      generate: GenerateFeature,
      summarize: SummarizeFeature,
      toc: TocFeature,
      synonym: SynonymFeature,
    };

    Object.entries(features).forEach(([key, config]) => {
      const FeatureClass = featureMap[key];
      if (FeatureClass) {
        const managerConfig = this.aiManager.getFeatureConfig(key as AiFeature);
        const featureConfig = typeof config === 'object' && config !== null
          ? { ...managerConfig, ...(config as Record<string, unknown>) }
          : managerConfig;
        this.featureInstances.push(new FeatureClass(this.quill, this.aiManager, featureConfig));
      }
    });
  }

  private addToolbarButton(): void {
    if (this.featureInstances.length === 0) return;

    const toolbar = this.quill.getModule('toolbar') as { container?: HTMLElement } | null;
    if (!toolbar || !toolbar.container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'ai-assistant-wrapper';

    this.button = document.createElement('button');
    this.button.className = 'ql-ai-assistant ai-assistant-btn';
    this.button.innerHTML = `
      <svg viewBox="0 0 18 18">
        <path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z"
              class="ql-fill" fill="currentColor"/>
      </svg>
    `;
    this.button.type = 'button';
    this.button.setAttribute('aria-label', 'AI Assistant');
    this.button.title = 'AI Assistant';
    this.button.setAttribute('aria-controls', PANEL_ID);
    this.button.setAttribute('aria-haspopup', 'menu');
    this.button.setAttribute('aria-expanded', 'false');

    this.button.addEventListener('click', (e) => {
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

  private bindKeyboardShortcut(shortcut: AiAssistantOptions['keyboardShortcut']): void {
    if (!shortcut) return;

    const key = shortcut.key === 'Space' ? ' ' : shortcut.key;
    const expectCtrl = !!shortcut.ctrlKey;
    const expectShift = !!shortcut.shiftKey;
    const expectAlt = !!shortcut.altKey;
    const expectMeta = !!shortcut.metaKey;

    this.quill.root.addEventListener('keydown', (event: KeyboardEvent) => {
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

  private getSelectionAnchorRect(): DOMRect | undefined {
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
      toJSON: () => ({}),
    } as DOMRect;
  }

  private togglePanel(): void {
    if (this.panel) {
      this.closePanel();
      return;
    }

    this.openPanel();
  }

  openPanel(anchorRect?: DOMRect, trigger?: HTMLElement): void {
    dismissAiSubmenu();
    if (this.panel) {
      this.closePanel();
      return;
    }

    this.panelAnchorRect = anchorRect;
    this.panelTrigger = trigger || this.button;
    this.panelTrigger?.setAttribute('aria-expanded', 'true');
    this.showPanel();
  }

  private showPanel(): void {
    this.panelSelection = this.quill.getSelection() || null;
    this.panelPreviousFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : null;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ai-assistant-backdrop';
    this.backdrop.addEventListener('click', () => this.closePanel());
    this.backdrop.addEventListener('contextmenu', (e) => e.preventDefault());
    document.body.appendChild(this.backdrop);

    this.panel = document.createElement('div');
    this.panel.className = 'ai-assistant-panel';
    this.panel.id = PANEL_ID;
    this.panel.setAttribute('role', 'menu');
    this.panelKeydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.closePanel();
        return;
      }
      if (!this.panel?.contains(event.target as Node)) return;
      if (event.key === 'Tab') {
        this.closePanel();
        return;
      }

      const items = Array.from(this.panel.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
      let nextIndex: number | null = null;
      if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
      if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = items.length - 1;
      if (nextIndex !== null && items[nextIndex]) {
        event.preventDefault();
        items[nextIndex].focus();
      }
    };
    document.addEventListener('keydown', this.panelKeydownHandler);

    const labels = this.aiManager.getLabels();

    const header = document.createElement('div');
    header.className = 'ai-assistant-panel-header';

    this.panel.setAttribute('aria-label', labels.panelTitle || 'AI Assistant');

    const mark = document.createElement('span');
    mark.className = 'ai-assistant-panel-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = featureIcon('<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/>');

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
        this.panel!.appendChild(divider);
      }

      const groupLabel = document.createElement('div');
      groupLabel.className = 'ai-assistant-group-label';
      groupLabel.textContent = group.label;
      this.panel.appendChild(groupLabel);

      group.items.forEach(({ feature, instance }) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'ai-assistant-item';

        const icon = document.createElement('span');
        icon.className = `ai-assistant-item-icon ai-assistant-icon-${feature.name}`;
        icon.innerHTML = FEATURE_ICONS[feature.name] || FEATURE_ICONS.generate;

        const text = document.createElement('span');
        text.className = 'ai-assistant-item-text';

        const label = document.createElement('div');
        label.className = 'ai-assistant-item-label';
        label.textContent = instance.label;

        const labels = this.aiManager.getLabels();
        const descMap: Record<AiFeature, string> = {
          rewrite: labels.descRewrite,
          translate: labels.descTranslate,
          grammar: labels.descGrammar,
          generate: labels.descGenerate,
          summarize: labels.descSummarize,
          toc: labels.descToc,
          synonym: labels.descSynonym,
        };

        const desc = document.createElement('div');
        desc.className = 'ai-assistant-item-desc';
        desc.textContent = descMap[feature.name] || '';
        item.setAttribute('role', 'menuitem');
        item.tabIndex = -1;

        text.appendChild(label);
        text.appendChild(desc);
        item.appendChild(icon);
        item.appendChild(text);

        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
        });
        item.addEventListener('click', () => {
          const selection = this.panelSelection;
          const btnRect = this.panelTrigger?.getBoundingClientRect() || this.button?.getBoundingClientRect();
          this.closePanel();
          if (selection) {
            this.quill.setSelection(selection.index, selection.length, 'api');
          }
          instance.trigger(btnRect);
        });

        this.panel!.appendChild(item);
      });
    });

    document.body.appendChild(this.panel);
    this.positionPanel();
    this.panel.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }

  private groupFeatures(): Array<{ label: string; items: Array<{ feature: AiFeatureInterface; instance: AiFeatureInterface }> }> {
    const groups: Record<string, Array<{ feature: AiFeatureInterface; instance: AiFeatureInterface }>> = {
      edit: [],
      create: [],
      analyze: [],
    };

    this.featureInstances.forEach((instance) => {
      const group = FEATURE_GROUPS[instance.name] || 'analyze';
      if (groups[group]) {
        groups[group].push({ feature: instance, instance });
      }
    });

    const labels = this.aiManager.getLabels();
    const result: Array<{ label: string; items: Array<{ feature: AiFeatureInterface; instance: AiFeatureInterface }> }> = [];
    Object.entries(groups).forEach(([key, items]) => {
      if (items.length > 0) {
        const labelKey = GROUP_LABEL_KEYS[key];
        result.push({ label: (labelKey ? labels[labelKey] : '') || key, items });
      }
    });

    return result;
  }

  private positionPanel(): void {
    if (!this.panel) return;

    const btnRect = this.panelAnchorRect || this.button?.getBoundingClientRect();
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

    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
  }

  private showLoading(): void {
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

  private hideLoading(): void {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
  }

  private showError(error: Error): void {
    this.errorEl?.remove();

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

  private closePanel(): void {
    const previousFocus = this.panelPreviousFocus;
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
    this.panelTrigger?.setAttribute('aria-expanded', 'false');
    this.panelTrigger = null;
    this.panelPreviousFocus = null;
    if (previousFocus?.isConnected) previousFocus.focus();
  }
}
