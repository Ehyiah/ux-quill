import { expandWordSelection } from "../utils/wordSelection.js";
import { showReviewModal } from "../utils/reviewModal.js";
export class RewriteFeature {
  constructor(quill, aiManager) {
    this.name = 'rewrite';
    this.label = void 0;
    this.requiresSelection = true;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureRewrite;
  }
  async trigger() {
    const quill = this.quill;
    const selection = quill.getSelection();
    if (!selection || selection.length === 0) {
      return;
    }
    const fullText = quill.getText();
    const wordRange = expandWordSelection(fullText, selection.index, selection.length);
    const selectedText = quill.getText(wordRange.index, wordRange.length).trim();
    if (!selectedText) return;
    const style = await this.promptStyle();
    if (!style) return;
    const provider = this.aiManager.getProvider();
    const labels = this.aiManager.getLabels();
    try {
      this.aiManager.setLoading(true);
      const rewritten = await provider.rewrite(selectedText, style);
      this.aiManager.setLoading(false);
      const edited = await showReviewModal({
        title: labels.featureRewrite,
        description: labels.rewriteStyleLabel.replace('{style}', style),
        originalText: selectedText,
        generatedText: rewritten
      }, labels);
      if (edited !== null) {
        quill.updateContents([{
          retain: wordRange.index
        }, {
          delete: wordRange.length
        }, {
          insert: edited
        }]);
      }
    } catch (error) {
      this.aiManager.setLoading(false);
      console.error('Rewrite failed:', error);
    }
  }
  async promptStyle() {
    const labels = this.aiManager.getLabels();
    const styles = [{
      value: 'formal',
      label: labels.rewriteFormal,
      desc: labels.rewriteFormalDesc
    }, {
      value: 'casual',
      label: labels.rewriteCasual,
      desc: labels.rewriteCasualDesc
    }, {
      value: 'concise',
      label: labels.rewriteConcise,
      desc: labels.rewriteConciseDesc
    }, {
      value: 'expanded',
      label: labels.rewriteExpanded,
      desc: labels.rewriteExpandedDesc
    }];
    return new Promise(resolve => {
      var _window$getSelection;
      const container = document.createElement('div');
      container.className = 'ai-assistant-submenu';
      const title = document.createElement('div');
      title.className = 'ai-assistant-submenu-title';
      title.textContent = labels.rewriteStyleTitle;
      container.appendChild(title);
      styles.forEach(s => {
        const item = document.createElement('button');
        item.className = 'ai-assistant-submenu-item';
        const iconMap = {
          formal: '\uD83D\uDCDB',
          casual: '\uD83D\uDE0A',
          concise: '\u26A1',
          expanded: '\uD83D\uDCD0'
        };
        const icon = document.createElement('span');
        icon.textContent = iconMap[s.value] || '\u2728';
        icon.style.cssText = 'flex-shrink:0;width:24px;text-align:center;font-size:16px;';
        const text = document.createElement('span');
        text.style.cssText = 'flex:1;min-width:0;';
        text.innerHTML = "<div style=\"font-size:13px;font-weight:500;\">" + s.label + "</div><div style=\"font-size:11px;color:#888;\">" + s.desc + "</div>";
        item.appendChild(icon);
        item.appendChild(text);
        item.addEventListener('click', () => {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(s.value);
        });
        container.appendChild(item);
      });
      const outsideClick = e => {
        if (!container.contains(e.target)) {
          document.removeEventListener('click', outsideClick);
          container.remove();
          resolve(null);
        }
      };
      setTimeout(() => {
        document.addEventListener('click', outsideClick);
      }, 0);
      document.body.appendChild(container);
      const rect = (_window$getSelection = window.getSelection()) == null || (_window$getSelection = _window$getSelection.getRangeAt(0)) == null ? void 0 : _window$getSelection.getBoundingClientRect();
      if (rect) {
        const maxX = window.innerWidth - container.offsetWidth - 8;
        const x = Math.max(8, Math.min(rect.left, maxX));
        container.style.left = x + "px";
        container.style.top = rect.bottom + 4 + "px";
      } else {
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
      }
    });
  }
}