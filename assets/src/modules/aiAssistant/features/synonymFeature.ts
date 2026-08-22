import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, SynonymResult } from '../aiTypes.js';

interface QuillSelection {
  index: number;
  length: number;
}

interface WordTarget {
  index: number;
  length: number;
  word: string;
}

type SynonymQuill = {
  getSelection(): QuillSelection | null;
  getText(index?: number, length?: number): string;
  updateContents(delta: unknown): void;
  setSelection(index: number, length: number, source?: string): void;
  getBounds(index: number, length?: number): { left: number; top: number; height: number; width: number };
  getLength(): number;
};

type CharAt = (index: number) => string;

function isWordChar(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    (code >= 192 && code <= 450) ||
    (code >= 0x0300 && code <= 0x036F) ||
    ch === '\'' ||
    ch === '\u2019' ||
    ch === '-'
  );
}

function isWhitespace(ch: string): boolean {
  return !ch || ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\u00A0' || ch === '\u200B';
}

function skipWhitespaceForward(start: number, end: number, getChar: CharAt): number {
  let index = start;
  while (index < end && isWhitespace(getChar(index))) {
    index++;
  }
  return index;
}

function skipWhitespaceBackward(start: number, end: number, getChar: CharAt): number {
  let index = end;
  while (index > start && isWhitespace(getChar(index - 1))) {
    index--;
  }
  return index;
}

function skipNonWordForward(start: number, end: number, getChar: CharAt): number {
  let index = start;
  while (index < end && !isWordChar(getChar(index))) {
    index++;
  }
  return index;
}

export class SynonymFeature implements AiFeatureInterface {
  readonly name: AiFeature = 'synonym';
  readonly label: string;
  readonly requiresSelection = true;

  private quill: unknown;
  private aiManager: AiManager;
  private config: Record<string, unknown>;

  constructor(quill: unknown, aiManager: AiManager, config: Record<string, unknown> = {}) {
    this.quill = quill;
    this.aiManager = aiManager;
    this.config = config;
    this.label = aiManager.getLabels().featureSynonym;
  }

  async trigger(): Promise<void> {
    const quill = this.quill as SynonymQuill;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) {
      return;
    }

    const target = this.resolveWordTarget(quill, selection);
    if (!target) {
      return;
    }

    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();
    const count = (this.config.count as number) || 5;

    try {
      this.aiManager.setLoading(true);
      const synonyms = await provider.findSynonyms(target.word, count);
      this.aiManager.setLoading(false);

      if (synonyms.length === 0) {
        this.showNoResultsPopup(target.word, labels, quill, target.index);
        return;
      }

      await this.showSynonymPopup(synonyms, target.word, labels, quill, { index: target.index, length: target.length });
    } catch (error) {
      this.aiManager.setLoading(false);
      this.aiManager.reportError(error);
    }
  }

  private resolveWordTarget(quill: SynonymQuill, selection: QuillSelection): WordTarget | null {
    const getChar: CharAt = (index) => (index < 0 || index >= quill.getLength() ? '' : quill.getText(index, 1) || '');

    const start = skipWhitespaceForward(selection.index, selection.index + selection.length, getChar);
    const end = skipWhitespaceBackward(start, selection.index + selection.length, getChar);
    if (start >= end) {
      return null;
    }

    const firstWordStart = skipNonWordForward(start, end, getChar);
    if (firstWordStart >= end) {
      return null;
    }

    let cleanStart = firstWordStart;
    while (cleanStart > 0 && isWordChar(getChar(cleanStart - 1))) {
      cleanStart--;
    }
    let cleanEnd = cleanStart;
    while (isWordChar(getChar(cleanEnd))) {
      cleanEnd++;
    }

    if (!this.isBoundedByWhitespace(cleanStart, cleanEnd, getChar)) {
      while (cleanStart > 0 && !isWhitespace(getChar(cleanStart - 1))) {
        cleanStart--;
      }
      while (cleanEnd < quill.getLength() - 1 && !isWhitespace(getChar(cleanEnd))) {
        cleanEnd++;
      }
    }

    const wordStart = skipNonWordForward(cleanStart, cleanEnd, getChar);
    let wordEnd = cleanEnd;
    while (wordEnd > wordStart && !isWordChar(getChar(wordEnd - 1))) {
      wordEnd--;
    }

    if (wordStart >= wordEnd) {
      return null;
    }

    const word = quill.getText(wordStart, wordEnd - wordStart);
    if (!word) {
      return null;
    }

    return { index: wordStart, length: word.length, word };
  }

  private isBoundedByWhitespace(start: number, end: number, getChar: CharAt): boolean {
    const boundedBefore = start === 0 || isWhitespace(getChar(start - 1));

    return boundedBefore && isWhitespace(getChar(end));
  }

  private showSynonymPopup(
    synonyms: SynonymResult[],
    originalWord: string,
    labels: { synonymTitle: string; synonymClickToReplace: string },
    quill: {
      getBounds(index: number, length?: number): { left: number; top: number; height: number; width: number };
      updateContents(delta: unknown): void;
      setSelection(index: number, length: number, source?: string): void;
    },
    wordRange: { index: number; length: number },
  ): Promise<void> {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';
      container.style.minWidth = '180px';

      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = `${labels.synonymTitle}: ${originalWord}`;
      container.appendChild(title);

      const hint = document.createElement('div');
      hint.style.cssText = 'padding: 4px 14px 8px; font-size: 10px; color: #999;';
      hint.textContent = labels.synonymClickToReplace;
      container.appendChild(hint);

      const wordIndex = wordRange.index;
      const wordLength = wordRange.length;

      const finish = () => {
        document.removeEventListener('click', outsideClick);
        document.removeEventListener('keydown', onKeyDown);
        container.remove();
        resolve();
      };

      const outsideClick = (e: MouseEvent) => {
        if (!container.contains(e.target as Node)) {
          finish();
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          finish();
        }
      };

      synonyms.forEach((syn) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'ai-assistant-submenu-item';

        const text = document.createElement('span');
        text.style.cssText = 'flex:1;font-size:13px;font-weight:500;';
        text.textContent = syn.word;

        item.appendChild(text);

        if (syn.score !== undefined && syn.score < 1) {
          const score = document.createElement('span');
          score.style.cssText = 'font-size:10px;color:#999;margin-left:8px;';
          score.textContent = `${Math.round(syn.score * 100)}%`;
          item.appendChild(score);
        }

        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          finish();

          quill.updateContents([
            { retain: wordIndex },
            { delete: wordLength },
            { insert: syn.word },
          ]);
          quill.setSelection(wordIndex + syn.word.length, 0, 'user');
        });
        container.appendChild(item);
      });

      setTimeout(() => {
        document.addEventListener('click', outsideClick);
        document.addEventListener('keydown', onKeyDown);
      }, 0);

      document.body.appendChild(container);

      const bounds = quill.getBounds(wordIndex, wordLength);
      if (bounds) {
        const editorRect = (quill as unknown as { container: HTMLElement }).container.getBoundingClientRect();
        const absoluteLeft = editorRect.left + bounds.left;
        const absoluteTop = editorRect.top + bounds.top + bounds.height;

        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(absoluteLeft, maxX));
        container.style.left = `${x}px`;
        container.style.top = `${absoluteTop + 4}px`;
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }

  private showNoResultsPopup(
    word: string,
    labels: { synonymTitle: string; synonymNoResults: string },
    quill: {
      getBounds(index: number, length?: number): { left: number; top: number; height: number; width: number };
    },
    wordIndex: number,
  ): void {
    const container = document.createElement('div');
    container.className = 'ai-assistant-submenu';
    container.style.minWidth = '180px';

    const title = document.createElement('div');
    title.className = 'ai-assistant-submenu-title';
    title.textContent = `${labels.synonymTitle}: ${word}`;
    container.appendChild(title);

    const noResults = document.createElement('div');
    noResults.style.cssText = 'padding: 12px 14px; font-size: 13px; color: #888; text-align: center;';
    noResults.textContent = labels.synonymNoResults;
    container.appendChild(noResults);

    const outsideClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        document.removeEventListener('click', outsideClick);
        container.remove();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', outsideClick);
    }, 0);

    document.body.appendChild(container);

    const bounds = quill.getBounds(wordIndex);
    if (bounds) {
      const editorRect = (quill as unknown as { container: HTMLElement }).container.getBoundingClientRect();
      const absoluteLeft = editorRect.left + bounds.left;
      const absoluteTop = editorRect.top + bounds.top + bounds.height;

      const maxX = window.innerWidth - container.offsetWidth - 8;
      const x = Math.max(8, Math.min(absoluteLeft, maxX));
      container.style.left = `${x}px`;
      container.style.top = `${absoluteTop + 4}px`;
    } else {
      container.style.top = '50%';
      container.style.left = '50%';
      container.style.transform = 'translate(-50%, -50%)';
    }

    setTimeout(() => {
      container.remove();
      document.removeEventListener('click', outsideClick);
    }, 2000);
  }
}
