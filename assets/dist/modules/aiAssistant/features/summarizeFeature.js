import { expandWordSelection } from "../utils/wordSelection.js";
import { showReviewModal } from "../utils/reviewModal.js";
const submenuIcon = paths => "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + paths + "</svg>";
const SUMMARY_FORMAT_ICONS = {
  paragraph: submenuIcon('<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4M10 12h6M10 16h6"/>'),
  bullets: submenuIcon('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r=".7"/><circle cx="4" cy="12" r=".7"/><circle cx="4" cy="18" r=".7"/>')
};
export class SummarizeFeature {
  constructor(quill, aiManager) {
    this.name = 'summarize';
    this.label = void 0;
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureSummarize;
  }
  async trigger(anchorRect) {
    const quill = this.quill;
    const selection = quill.getSelection();
    let textToSummarize;
    let insertIndex;
    if (selection && selection.length > 0) {
      const getChar = i => {
        if (i < 0 || i >= quill.getLength()) return '';
        return quill.getText(i, 1) || '';
      };
      const wordRange = expandWordSelection(getChar, selection.index, selection.length);
      textToSummarize = quill.getText(wordRange.index, wordRange.length).trim();
      insertIndex = wordRange.index + wordRange.length;
    } else {
      textToSummarize = quill.getText().trim();
      insertIndex = quill.getLength();
    }
    if (!textToSummarize) return;
    const format = await this.promptFormat(anchorRect);
    if (!format) return;
    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();
    try {
      this.aiManager.setLoading(true);
      const summary = await provider.summarize(textToSummarize, format);
      this.aiManager.setLoading(false);
      const edited = await showReviewModal({
        title: labels.summarizeResultTitle,
        description: format === 'bullets' ? labels.summarizeResultBullets : labels.summarizeResultParagraph,
        originalText: textToSummarize,
        generatedText: summary,
        onRegenerate: () => provider.summarize(textToSummarize, format)
      }, labels);
      if (edited !== null) {
        const prefix = format === 'bullets' ? labels.summarizePrefix : labels.summarizePrefix;
        quill.updateContents([{
          retain: insertIndex
        }, {
          insert: "" + prefix + edited
        }]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      this.aiManager.reportError(error);
    }
  }
  async promptFormat(anchorRect) {
    const labels = this.aiManager.getLabels();
    const options = [{
      value: 'paragraph',
      label: labels.summarizeParagraph,
      desc: labels.summarizeParagraphDesc
    }, {
      value: 'bullets',
      label: labels.summarizeBullets,
      desc: labels.summarizeBulletsDesc
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';
      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = labels.summarizeFormatTitle;
      container.appendChild(title);
      options.forEach(opt => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'ai-assistant-submenu-item';
        const icon = document.createElement('span');
        icon.className = "ai-assistant-submenu-icon ai-assistant-format-" + opt.value;
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = SUMMARY_FORMAT_ICONS[opt.value];
        const copy = document.createElement('span');
        copy.className = 'ai-assistant-submenu-copy';
        const labelEl = document.createElement('span');
        labelEl.className = 'ai-assistant-submenu-label';
        labelEl.textContent = opt.label;
        const descEl = document.createElement('span');
        descEl.className = 'ai-assistant-submenu-description';
        descEl.textContent = opt.desc;
        copy.appendChild(labelEl);
        copy.appendChild(descEl);
        item.appendChild(icon);
        item.appendChild(copy);
        item.addEventListener('click', () => {
          finish(opt.value);
        });
        container.appendChild(item);
      });
      const outsideClick = e => {
        if (!container.contains(e.target)) {
          finish(null);
        }
      };
      const onKeyDown = e => {
        if (e.key === 'Escape') {
          finish(null);
        }
      };
      const finish = value => {
        document.removeEventListener('click', outsideClick);
        document.removeEventListener('keydown', onKeyDown);
        container.remove();
        resolve(value);
      };
      setTimeout(() => {
        document.addEventListener('click', outsideClick);
        document.addEventListener('keydown', onKeyDown);
      }, 0);
      document.body.appendChild(container);
      const refRect = anchorRect || ((_window$getSelection = window.getSelection()) == null || (_window$getSelection = _window$getSelection.getRangeAt(0)) == null ? void 0 : _window$getSelection.getBoundingClientRect());
      if (refRect) {
        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(refRect.left, maxX));
        const below = refRect.bottom + 4;
        const maxY = Math.max(8, window.innerHeight - container.offsetHeight - 8);
        const y = below <= maxY ? below : Math.max(8, refRect.top - container.offsetHeight - 4);
        container.style.left = x + "px";
        container.style.top = Math.min(y, maxY) + "px";
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}