export class SemanticFeature {
  constructor(quill, aiManager) {
    this.name = 'semantic';
    this.label = void 0;
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.label = aiManager.getLabels().featureSemantic;
  }
  async trigger() {
    const quill = this.quill;
    const fullText = quill.getText().trim();
    if (!fullText) return;
    const provider = this.aiManager.getProvider();
    try {
      const result = await provider.analyze(fullText);
      this.showModal(result);
    } catch (error) {
      console.error('Semantic analysis failed:', error);
    }
  }
  showModal(result) {
    const labels = this.aiManager.getLabels();
    const overlay = document.createElement('div');
    overlay.className = 'ai-assistant-modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'ai-assistant-modal';
    const title = document.createElement('h3');
    title.textContent = labels.semanticTitle;
    const stats = document.createElement('div');
    stats.style.cssText = 'margin-bottom:16px;padding:14px;background:#f7f8fa;border-radius:8px;font-size:13px;line-height:1.7;';
    stats.innerHTML = "\n      <strong style=\"font-size:13px;\">" + labels.semanticStats + "</strong><br>\n      " + labels.semanticWords + " : " + result.wordCount + " &middot;\n      " + labels.semanticReadingTime + " : " + result.readingTime + " min<br>\n      " + labels.semanticTopics + " : " + (result.topics.length > 0 ? result.topics.join(', ') : '\u2014') + "<br>\n      " + labels.semanticKeywordsCount + " : " + result.keywords.length + "\n    ";
    const keywordsTitle = document.createElement('p');
    keywordsTitle.textContent = labels.semanticKeywordsTitle;
    keywordsTitle.style.cssText = 'font-weight:600;margin:14px 0 8px;font-size:13px;color:#555;';
    const keywordGrid = document.createElement('div');
    keywordGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    const maxFreq = result.keywords.length > 0 ? result.keywords[0].frequency : 1;
    result.keywords.forEach(kw => {
      const tag = document.createElement('span');
      const size = Math.max(0.8, Math.min(1.5, 0.8 + kw.frequency / maxFreq * 0.7));
      const opacity = Math.max(0.5, Math.min(1, 0.5 + kw.frequency / maxFreq * 0.5));
      tag.textContent = kw.word;
      tag.style.cssText = "display:inline-block;padding:4px 10px;background:#e8f0fe;border-radius:6px;font-size:" + size + "em;opacity:" + opacity + ";color:#1a1a1a;";
      keywordGrid.appendChild(tag);
    });
    const actions = document.createElement('div');
    actions.className = 'ai-assistant-modal-actions';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ai-assistant-btn-primary';
    closeBtn.textContent = labels.btnClose;
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
    actions.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(stats);
    modal.appendChild(keywordsTitle);
    modal.appendChild(keywordGrid);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
}