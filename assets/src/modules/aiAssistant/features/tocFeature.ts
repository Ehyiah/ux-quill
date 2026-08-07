import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface } from '../aiTypes.js';

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

export class TocFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'toc';
  readonly label: string;
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;
  private depth: number;

  constructor(quill: unknown, aiManager: AiManager, config: Record<string, unknown> = {}) {
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureToc;
    this.depth = (config.depth as number) || 3;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as {
      getContents(start?: number, length?: number): { ops: Array<Record<string, unknown>> };
      getLength(): number;
      insertEmbed(index: number, type: string, value: unknown, source: string): void;
      updateContents(delta: { ops: Array<Record<string, unknown>> }): void;
      getText(): string;
      scroll: { domNode: HTMLElement };
    };

    const raw = this.extractHeaders(quill);
    if (raw.length === 0) return;

    const entries: TocEntry[] = raw.map((h) => ({
      ...h,
      id: this.generateId(h.text),
    }));

    const headers = quill.scroll.domNode.querySelectorAll('h1, h2, h3, h4, h5, h6');
    entries.forEach((entry, i) => {
      if (headers[i]) {
        (headers[i] as HTMLElement).id = entry.id;
      }
    });

    const first = quill.getContents(0, 1).ops?.[0]?.insert;
    if (first && typeof first === 'object' && 'toc' in first) {
      quill.updateContents([{ delete: 1 }]);
    }

    quill.insertEmbed(0, 'toc', entries, 'user');
    quill.updateContents([
      { retain: 1 },
      { insert: '\n' },
    ]);
  }

  private extractHeaders(quill: { scroll: { domNode: HTMLElement } }): Array<{ level: number; text: string }> {
    const headers = quill.scroll.domNode.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const entries: Array<{ level: number; text: string }> = [];

    headers.forEach((h) => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (level <= this.depth) {
        entries.push({ level, text: h.textContent || '' });
      }
    });

    return entries;
  }

  private generateId(text: string): string {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }
}
