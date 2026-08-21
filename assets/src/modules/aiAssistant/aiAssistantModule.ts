import type Quill from 'quill';
import { AiManager } from './aiManager.js';
import type { AiFeature, AiFeatureInterface, AiLabels } from './aiTypes.js';
import { RewriteFeature } from './features/rewriteFeature.js';
import { TranslateFeature } from './features/translateFeature.js';
import { GrammarFeature } from './features/grammarFeature.js';
import { GenerateFeature } from './features/generateFeature.js';
import { SummarizeFeature } from './features/summarizeFeature.js';
import { TocFeature } from './features/tocFeature.js';
import { SynonymFeature } from './features/synonymFeature.js';

interface AiAssistantOptions {
  aiManager: AiManager;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
  keyboardShortcut?: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } | false;
}

interface FeatureMeta {
  icon: string;
  desc: string;
  group: 'edit' | 'create' | 'analyze';
}

const FEATURE_ICONS: Record<AiFeature, string> = {
  rewrite: '\u270D\uFE0F',
  translate: '\uD83C\uDF10',
  grammar: '\u2714\uFE0F',
  summarize: '\uD83D\uDCDD',
  generate: '\u2728',
  toc: '\uD83D\uDCD1',
  synonym: '\uD83D\uDD04',
};

const FEATURE_GROUPS: Record<AiFeature, 'edit' | 'create' | 'analyze'> = {
  rewrite: 'edit',
  translate: 'edit',
  grammar: 'edit',
  summarize: 'create',
  generate: 'create',
  toc: 'analyze',
  synonym: 'edit',
};

const GROUP_LABELS: Record<string, string> = {
  edit: 'Edit',
  create: 'Create',
  analyze: 'Analyze',
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
  width: 320px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(30, 41, 70, .16), 0 3px 10px rgba(30, 41, 70, .08);
  padding: 8px;
  animation: aiPanelIn .18s ease-out;
  transform-origin: top left;
}
@keyframes aiPanelIn {
  from { opacity: 0; transform: scale(.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ai-assistant-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 12px;
  border-bottom: 1px solid #eef1f6;
  color: #19233d;
}
.ai-assistant-panel-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e8edff, #f2eaff);
  color: #5965d8;
  font-size: 18px;
  line-height: 1;
}
.ai-assistant-panel-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -.01em;
}

.ai-assistant-divider {
  height: 1px;
  background: #eef1f6;
  margin: 6px 8px;
}

.ai-assistant-group-label {
  padding: 14px 8px 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9aa3b6;
  cursor: default;
}

.ai-assistant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background .15s, border-color .15s, transform .15s;
}
.ai-assistant-item:hover { background: #f6f7ff; border-color: #e4e7fb; }
.ai-assistant-item:active { background: #edf0ff; transform: scale(.99); }
.ai-assistant-item:focus-visible,
.ai-assistant-submenu-item:focus-visible {
  outline: 3px solid rgba(89, 101, 216, .24);
  outline-offset: 1px;
}

.ai-assistant-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f3f8;
  font-size: 16px;
  transition: background .15s, transform .15s;
}
.ai-assistant-item:hover .ai-assistant-item-icon {
  background: #e6e9ff;
  transform: translateY(-1px);
}

.ai-assistant-item-text {
  flex: 1;
  min-width: 0;
}
.ai-assistant-item-label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.3;
}
.ai-assistant-item-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.3;
  margin-top: 1px;
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
  background: rgba(255,255,255,.7);
}
.ai-assistant-loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #e0e0e0;
  border-top-color: #06c;
  border-radius: 50%;
  animation: aiSpinnerRotate .7s linear infinite;
}
.ai-assistant-loading-text {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
  text-align: center;
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

.ai-assistant-submenu {
  position: fixed;
  z-index: 100000;
  width: 248px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border: 1px solid #e5e9f2;
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(30, 41, 70, .16), 0 3px 10px rgba(30, 41, 70, .08);
  padding: 8px;
  animation: aiPanelIn .16s ease-out;
}
.ai-assistant-submenu-title {
  padding: 7px 8px 10px;
  border-bottom: 1px solid #eef1f6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .01em;
  color: #58627a;
}
.ai-assistant-submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 13px;
  color: #1a1a1a;
  transition: background .15s, border-color .15s;
}
.ai-assistant-submenu-item:hover { background: #f6f7ff; border-color: #e4e7fb; }
.ai-assistant-submenu-item:active { background: #edf0ff; }
.ai-assistant-submenu-copy {
  flex: 1;
  min-width: 0;
}
.ai-assistant-submenu-label {
  display: block;
  color: #202942;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}
.ai-assistant-submenu-description {
  display: block;
  margin-top: 2px;
  color: #8a93a8;
  font-size: 11px;
  line-height: 1.3;
}
.ai-assistant-submenu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 8px;
  background: #f1f3f8;
  font-size: 15px;
  line-height: 1;
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
      const textEl = el.querySelector('.ai-assistant-loading-text') as HTMLElement | null;
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
        const featureConfig = typeof config === 'object' && config !== null ? (config as Record<string, unknown>) : {};
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
    this.button.setAttribute('aria-label', 'AI Assistant');
    this.button.title = 'AI Assistant';

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

  openPanel(anchorRect?: DOMRect): void {
    this.panelAnchorRect = anchorRect;
    this.showPanel();
  }

  private showPanel(): void {
    this.panelSelection = this.quill.getSelection() || null;
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ai-assistant-backdrop';
    this.backdrop.addEventListener('click', () => this.closePanel());
    this.backdrop.addEventListener('contextmenu', (e) => e.preventDefault());
    document.body.appendChild(this.backdrop);

    this.panel = document.createElement('div');
    this.panel.className = 'ai-assistant-panel';

    const header = document.createElement('div');
    header.className = 'ai-assistant-panel-header';

    const mark = document.createElement('span');
    mark.className = 'ai-assistant-panel-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '\u2728';

    const title = document.createElement('span');
    title.className = 'ai-assistant-panel-title';
    title.textContent = 'AI Assistant';

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

        text.appendChild(label);
        text.appendChild(desc);
        item.appendChild(icon);
        item.appendChild(text);

        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const btnRect = this.button?.getBoundingClientRect();
          this.closePanel();
          if (this.panelSelection) {
            this.quill.setSelection(this.panelSelection.index, this.panelSelection.length, 'api');
          }
          instance.trigger(btnRect);
        });

        this.panel!.appendChild(item);
      });
    });

    document.body.appendChild(this.panel);
    this.positionPanel();
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

    const result: Array<{ label: string; items: Array<{ feature: AiFeatureInterface; instance: AiFeatureInterface }> }> = [];
    Object.entries(groups).forEach(([key, items]) => {
      if (items.length > 0) {
        result.push({ label: GROUP_LABELS[key] || key, items });
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
    el.style.flexDirection = 'column';
    const spinner = document.createElement('div');
    spinner.className = 'ai-assistant-loading-spinner';
    el.appendChild(spinner);
    const text = document.createElement('div');
    text.className = 'ai-assistant-loading-text';
    text.textContent = 'Chargement...';
    el.appendChild(text);
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
    this.panelSelection = null;
    this.panelAnchorRect = undefined;
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
