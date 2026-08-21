import type { AiManager } from '../aiManager.js';
import type { AiFeature, AiFeatureInterface, SynonymResult } from '../aiTypes.js';
import { getSingleWordRange } from '../utils/wordSelection.js';


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
    const quill = this.quill as {
      getSelection(): { index: number; length: number } | null;
      getText(index?: number, length?: number): string;
      updateContents(delta: unknown): void;
      setSelection(index: number, length: number, source?: string): void;
      getBounds(index: number, length?: number): { left: number; top: number; height: number; width: number };
      getLength(): number;
    };

    const selection = quill.getSelection();
    if (!selection || selection.length === 0) {
      return;
    }

    const isWordChar = (ch: string): boolean => {
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
    };

    const isWhitespace = (ch: string) => 
      !ch || ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\u00A0' || ch === '\u200B';

    const getChar = (i: number): string => {
      if (i < 0 || i >= quill.getLength()) return '';
      return quill.getText(i, 1) || '';
    };

    let start = selection.index;
    let end = selection.index + selection.length;

    // Trim leading/trailing spaces from the selection
    while (start < end && isWhitespace(getChar(start))) {
      start++;
    }
    while (end > start && isWhitespace(getChar(end - 1))) {
      end--;
    }

    if (start >= end) return;

    // Find the first word character in the trimmed selection
    let firstWordChar = start;
    while (firstWordChar < end && !isWordChar(getChar(firstWordChar))) {
      firstWordChar++;
    }
    if (firstWordChar >= end) return;

    // Find the clean first word bounds
    let cleanStart = firstWordChar;
    while (cleanStart > 0 && isWordChar(getChar(cleanStart - 1))) {
      cleanStart--;
    }
    let cleanEnd = cleanStart;
    while (isWordChar(getChar(cleanEnd))) {
      cleanEnd++;
    }

    // Check if the clean word is complete (bounded by whitespace)
    const isComplete = (cleanStart === 0 || isWhitespace(getChar(cleanStart - 1))) && 
                       (isWhitespace(getChar(cleanEnd)));

    if (!isComplete) {
      // Expand to whitespace boundaries
      while (cleanStart > 0 && !isWhitespace(getChar(cleanStart - 1))) {
        cleanStart--;
      }
      while (cleanEnd < quill.getLength() - 1 && !isWhitespace(getChar(cleanEnd))) {
        cleanEnd++;
      }
    }

    // Split leading/trailing non-word characters from the extended range
    let finalWordStart = cleanStart;
    while (finalWordStart < cleanEnd && !isWordChar(getChar(finalWordStart))) {
      finalWordStart++;
    }

    let finalWordEnd = cleanEnd;
    while (finalWordEnd > finalWordStart && !isWordChar(getChar(finalWordEnd - 1))) {
      finalWordEnd--;
    }

    if (finalWordStart >= finalWordEnd) return;

    const selectedWord = quill.getText(finalWordStart, finalWordEnd - finalWordStart);
    if (!selectedWord) return;

    const finalWordRange = {
      index: finalWordStart,
      length: selectedWord.length,
    };

    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();
    const count = (this.config.count as number) || 5;

    try {
      this.aiManager.setLoading(true);
      const synonyms = await provider.findSynonyms(selectedWord, count);
      this.aiManager.setLoading(false);

      if (synonyms.length === 0) {
        this.showNoResultsPopup(selectedWord, labels, quill, finalWordRange.index);
        return;
      }

      await this.showSynonymPopup(synonyms, selectedWord, labels, quill, finalWordRange);
    } catch (error) {
      this.aiManager.setLoading(false);
      this.aiManager.reportError(error);
    }
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

      synonyms.forEach((syn) => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';

        const text = document.createElement('span');
        text.style.cssText = 'flex:1;font-size:13px;font-weight:500;';
        text.textContent = syn.word;

        if (syn.score !== undefined && syn.score < 1) {
          const score = document.createElement('span');
          score.style.cssText = 'font-size:10px;color:#999;margin-left:8px;';
          score.textContent = `${Math.round(syn.score * 100)}%`;
          item.appendChild(text);
          item.appendChild(score);
        } else {
          item.appendChild(text);
        }

        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          document.removeEventListener('click', outsideClick);
          container.remove();

          quill.updateContents([
            { retain: wordIndex },
            { delete: wordLength },
            { insert: syn.word },
          ]);
          quill.setSelection(wordIndex + syn.word.length, 0, 'user');
          resolve();
        });
        container.appendChild(item);
      });

      const outsideClick = (e: MouseEvent) => {
        if (!container.contains(e.target as Node)) {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve();
        }
      };

      setTimeout(() => {
        document.addEventListener('click', outsideClick);
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
