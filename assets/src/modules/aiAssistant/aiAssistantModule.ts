import type Quill from 'quill';
import { AiManager } from './aiManager.js';
import type { AiFeature, AiFeatureInterface } from './aiTypes.js';
import { RewriteFeature } from './features/rewriteFeature.js';
import { TranslateFeature } from './features/translateFeature.js';
import { GrammarFeature } from './features/grammarFeature.js';
import { GenerateFeature } from './features/generateFeature.js';
import { SummarizeFeature } from './features/summarizeFeature.js';
import { SemanticFeature } from './features/semanticFeature.js';
import { TocFeature } from './features/tocFeature.js';

interface AiAssistantOptions {
  aiManager: AiManager;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
}

interface FeatureMeta {
  icon: string;
  desc: string;
  group: 'edit' | 'create' | 'analyze';
}

const FEATURE_META: Record<AiFeature, FeatureMeta> = {
  rewrite:    { icon: '\u270D\uFE0F', desc: 'Changer le style du texte s\u00E9lectionn\u00E9', group: 'edit' },
  translate:  { icon: '\uD83C\uDF10', desc: 'Traduire dans une autre langue', group: 'edit' },
  grammar:    { icon: '\u2714\uFE0F', desc: 'Corriger les fautes d\u2019orthographe', group: 'edit' },
  summarize:  { icon: '\uD83D\uDCDD', desc: 'R\u00E9sumer le contenu', group: 'create' },
  generate:   { icon: '\u2728', desc: 'G\u00E9n\u00E9rer du texte par IA', group: 'create' },
  semantic:   { icon: '\uD83D\uDCCA', desc: 'Analyser les mots-cl\u00E9s et sujets', group: 'analyze' },
  toc:        { icon: '\uD83D\uDCD1', desc: 'Cr\u00E9er une table des mati\u00E8res', group: 'analyze' },
};

const GROUP_LABELS: Record<string, string> = {
  edit: '\u00C9dition',
  create: 'Cr\u00E9ation',
  analyze: 'Analyse',
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
.ai-assistant-btn svg { width: 18px; height: 18px; display: block; }

.ai-assistant-panel {
  position: fixed;
  z-index: 99999;
  min-width: 280px;
  max-width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  padding: 6px 0;
  animation: aiPanelIn .15s ease-out;
  transform-origin: top left;
}
@keyframes aiPanelIn {
  from { opacity: 0; transform: scale(.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ai-assistant-panel-header {
  padding: 10px 14px 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: #888;
}

.ai-assistant-group-label {
  padding: 10px 14px 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: #aaa;
  cursor: default;
}

.ai-assistant-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background .1s;
}
.ai-assistant-item:hover { background: #f0f4ff; }
.ai-assistant-item:active { background: #dde8ff; }

.ai-assistant-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f4f6f8;
  font-size: 16px;
}
.ai-assistant-item:hover .ai-assistant-item-icon {
  background: #e4ecff;
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

.ai-assistant-submenu {
  position: fixed;
  z-index: 100000;
  min-width: 200px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  padding: 6px 0;
  animation: aiPanelIn .12s ease-out;
}
.ai-assistant-submenu-title {
  padding: 8px 14px 2px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: #aaa;
}
.ai-assistant-submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 13px;
  color: #1a1a1a;
  transition: background .1s;
}
.ai-assistant-submenu-item:hover { background: #f0f4ff; }
.ai-assistant-submenu-item:active { background: #dde8ff; }

.ai-assistant-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: rgba(0,0,0,.25);
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
  border-radius: 12px;
  padding: 24px;
  width: 620px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0,0,0,.2);
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

  constructor(quill: Quill, options: AiAssistantOptions) {
    this.quill = quill;
    this.aiManager = options.aiManager;
    injectStyles();
    this.initializeFeatures(options);
    this.addToolbarButton();
    this.aiManager.onLoadingChange((loading) => {
      if (loading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });
  }

  private initializeFeatures(options: AiAssistantOptions): void {
    const features = options.features || {};
    const featureMap: Record<string, new (quill: unknown, aiManager: AiManager, config?: Record<string, unknown>) => AiFeatureInterface> = {
      rewrite: RewriteFeature,
      translate: TranslateFeature,
      grammar: GrammarFeature,
      generate: GenerateFeature,
      summarize: SummarizeFeature,
      semantic: SemanticFeature,
      toc: TocFeature,
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

  private togglePanel(): void {
    if (this.panel) {
      this.closePanel();
      return;
    }

    this.showPanel();
  }

  private showPanel(): void {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ai-assistant-backdrop';
    this.backdrop.addEventListener('click', () => this.closePanel());
    this.backdrop.addEventListener('contextmenu', (e) => e.preventDefault());
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
        this.panel!.appendChild(divider);
      }

      const groupLabel = document.createElement('div');
      groupLabel.className = 'ai-assistant-group-label';
      groupLabel.textContent = group.label;
      this.panel.appendChild(groupLabel);

      group.items.forEach(({ feature, instance }) => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-item';

        const meta = FEATURE_META[feature.name];

        const icon = document.createElement('span');
        icon.className = 'ai-assistant-item-icon';
        icon.textContent = meta?.icon || '\u2728';

        const text = document.createElement('span');
        text.className = 'ai-assistant-item-text';

        const label = document.createElement('div');
        label.className = 'ai-assistant-item-label';
        label.textContent = instance.label;

        const desc = document.createElement('div');
        desc.className = 'ai-assistant-item-desc';
        desc.textContent = meta?.desc || '';

        text.appendChild(label);
        text.appendChild(desc);
        item.appendChild(icon);
        item.appendChild(text);

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closePanel();
          instance.trigger();
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
      const meta = FEATURE_META[instance.name];
      const group = meta?.group || 'analyze';
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

    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
  }

  private showLoading(): void {
    if (this.loadingEl) return;
    const el = document.createElement('div');
    el.className = 'ai-assistant-loading';
    const spinner = document.createElement('div');
    spinner.className = 'ai-assistant-loading-spinner';
    el.appendChild(spinner);
    document.body.appendChild(el);
    this.loadingEl = el;
  }

  private hideLoading(): void {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
  }

  private closePanel(): void {
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
