import type Quill from 'quill';
import { AiManager } from './aiManager';
import type { AiFeature, AiFeatureInterface } from './aiTypes';
import { RewriteFeature } from './features/rewriteFeature';
import { TranslateFeature } from './features/translateFeature';
import { GrammarFeature } from './features/grammarFeature';
import { GenerateFeature } from './features/generateFeature';
import { SummarizeFeature } from './features/summarizeFeature';
import { SemanticFeature } from './features/semanticFeature';
import { TocFeature } from './features/tocFeature';

interface AiAssistantOptions {
  aiManager: AiManager;
  features?: Partial<Record<AiFeature, boolean | Record<string, unknown>>>;
}

export class AiAssistantModule {
  private quill: Quill;
  private aiManager: AiManager;
  private featureInstances: AiFeatureInterface[] = [];
  private button: HTMLElement | null = null;
  private dropdown: HTMLElement | null = null;
  private initialized = false;

  constructor(quill: Quill, options: AiAssistantOptions) {
    this.quill = quill;
    this.aiManager = options.aiManager;

    this.initializeFeatures(options);
    this.addToolbarButton();
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
      if (FeatureClass && this.aiManager.isFeatureSupported(key as AiFeature)) {
        const featureConfig = typeof config === 'object' && config !== null ? (config as Record<string, unknown>) : {};
        this.featureInstances.push(new FeatureClass(this.quill, this.aiManager, featureConfig));
      }
    });
  }

  private addToolbarButton(): void {
    if (this.featureInstances.length === 0) return;

    const toolbar = this.quill.getModule('toolbar') as { container?: HTMLElement } | null;
    if (!toolbar || !toolbar.container) return;

    this.button = document.createElement('button');
    this.button.className = 'ql-ai-assistant';
    this.button.innerHTML = `
      <svg viewBox="0 0 18 18" style="width:18px;height:18px;">
        <path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" 
              class="ql-fill" fill="currentColor"/>
      </svg>
    `;
    this.button.title = 'AI Assistant';
    this.button.style.cssText = 'position:relative;';

    this.button.addEventListener('click', (e) => {
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

  private toggleDropdown(): void {
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
      return;
    }

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ql-ai-dropdown';
    this.dropdown.style.cssText = `
      position:absolute;top:100%;left:0;background:#fff;border:1px solid #ccc;
      border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);z-index:9999;
      min-width:200px;white-space:nowrap;
    `;

    this.featureInstances.forEach((feature) => {
      const item = document.createElement('button');
      item.textContent = feature.label;
      item.className = 'ql-ai-dropdown-item';
      item.style.cssText = `
        display:block;width:100%;padding:8px 16px;border:none;background:none;
        text-align:left;cursor:pointer;font-size:14px;font-family:inherit;
      `;
      item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#f0f0f0'; });
      item.addEventListener('mouseleave', () => { item.style.backgroundColor = ''; });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDropdown();
        feature.trigger();
      });
      this.dropdown!.appendChild(item);
    });

    const rect = this.button!.getBoundingClientRect();
    const toolbar = this.quill.getModule('toolbar') as { container?: HTMLElement } | null;
    if (toolbar?.container) {
      const toolbarRect = toolbar.container.getBoundingClientRect();
      this.dropdown.style.left = `${rect.left - toolbarRect.left}px`;
      this.dropdown.style.top = `${rect.bottom - toolbarRect.top}px`;
    }

    toolbar?.container?.appendChild(this.dropdown);

    const closeHandler = (e: MouseEvent) => {
      if (this.dropdown && !this.dropdown.contains(e.target as Node) && e.target !== this.button) {
        this.closeDropdown();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }

  private closeDropdown(): void {
    if (this.dropdown) {
      this.dropdown.remove();
      this.dropdown = null;
    }
  }
}
