export class SemanticFeature {
  constructor(quill, aiManager) {
    this.name = 'semantic';
    this.label = 'Analyser le contenu';
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
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
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:9998;display:flex;align-items:center;justify-content:center;';
    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:8px;padding:24px;width:450px;max-width:90vw;max-height:80vh;overflow-y:auto;box-shadow:0 4px 24px rgba(0,0,0,0.2);';
    const title = document.createElement('h3');
    title.textContent = 'Analyse du contenu';
    title.style.cssText = 'margin:0 0 16px;font-size:18px;';
    const stats = document.createElement('div');
    stats.style.cssText = 'margin-bottom:16px;padding:12px;background:#f5f5f5;border-radius:4px;font-size:14px;';
    stats.innerHTML = "\n      <strong>Statistiques</strong><br>\n      Mots : " + result.wordCount + "<br>\n      Temps de lecture : " + result.readingTime + " min<br>\n      Sujets : " + (result.topics.length > 0 ? result.topics.join(', ') : '—') + "<br>\n      Mots-cl\xE9s : " + result.keywords.length + "\n    ";
    const keywordsTitle = document.createElement('p');
    keywordsTitle.textContent = 'Mots-clés';
    keywordsTitle.style.cssText = 'font-weight:600;margin:12px 0 8px;font-size:14px;';
    const keywordGrid = document.createElement('div');
    keywordGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    const maxFreq = result.keywords.length > 0 ? result.keywords[0].frequency : 1;
    result.keywords.forEach(kw => {
      const tag = document.createElement('span');
      const size = Math.max(0.8, Math.min(1.5, 0.8 + kw.frequency / maxFreq * 0.7));
      const opacity = Math.max(0.5, Math.min(1, 0.5 + kw.frequency / maxFreq * 0.5));
      tag.textContent = kw.word;
      tag.style.cssText = "display:inline-block;padding:4px 8px;background:#e8f0fe;border-radius:4px;font-size:" + size + "em;opacity:" + opacity + ";";
      keywordGrid.appendChild(tag);
    });
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fermer';
    closeBtn.style.cssText = 'display:block;margin-top:16px;margin-left:auto;padding:8px 24px;border:none;border-radius:4px;background:#0066cc;color:#fff;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
    modal.appendChild(title);
    modal.appendChild(stats);
    modal.appendChild(keywordsTitle);
    modal.appendChild(keywordGrid);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
}