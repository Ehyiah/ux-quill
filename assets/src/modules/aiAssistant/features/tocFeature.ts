import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface } from '../aiTypes.js';

interface TocEntry {
  level: number;
  text: string;
  index: number;
}

export class TocFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'toc';
  readonly label = 'Générer le sommaire';
  readonly requiresSelection = false;

  private quill: unknown;
  private aiManager: AiManager;
  private depth: number;

  constructor(quill: unknown, aiManager: AiManager, config: Record<string, unknown> = {}) {
    this.quill = quill;
    this.aiManager = aiManager;
    this.depth = (config.depth as number) || 3;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as { getContents(): { ops: Array<Record<string, unknown>> }; getLength(): number; updateContents(delta: { ops: Array<Record<string, unknown>> }): void; getText(): string; scroll: { domNode: HTMLElement } };
    const entries = this.extractHeaders(quill);

    if (entries.length === 0) return;

    const tocHtml = this.buildTocHtml(entries);
    const insertIndex = 0;

    quill.updateContents([
      { retain: insertIndex },
      { insert: tocHtml, attributes: { list: 'bullet' } },
    ]);
  }

  private extractHeaders(quill: { scroll: { domNode: HTMLElement } }): TocEntry[] {
    const headers = quill.scroll.domNode.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const entries: TocEntry[] = [];

    headers.forEach((h) => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (level <= this.depth) {
        entries.push({
          level,
          text: h.textContent || '',
          index: charIndex,
        });
      }
    });

    return entries;
  }

  private buildTocHtml(entries: TocEntry[]): string {
    return entries
      .map((e) => {
        const indent = '  '.repeat(e.level - 1);
        return `${indent}• ${e.text}`;
      })
      .join('\n');
  }
}
