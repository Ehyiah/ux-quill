export class TocFeature {
  constructor(quill, aiManager, config) {
    if (config === void 0) {
      config = {};
    }
    this.name = 'toc';
    this.label = 'Générer le sommaire';
    this.requiresSelection = false;
    this.quill = void 0;
    this.aiManager = void 0;
    this.depth = void 0;
    this.quill = quill;
    this.aiManager = aiManager;
    this.depth = config.depth || 3;
  }
  async trigger() {
    const quill = this.quill;
    const entries = this.extractHeaders(quill);
    if (entries.length === 0) return;
    const tocHtml = this.buildTocHtml(entries);
    const insertIndex = 0;
    quill.updateContents([{
      retain: insertIndex
    }, {
      insert: tocHtml,
      attributes: {
        list: 'bullet'
      }
    }]);
  }
  extractHeaders(quill) {
    const headers = quill.scroll.domNode.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const entries = [];
    headers.forEach(h => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (level <= this.depth) {
        entries.push({
          level,
          text: h.textContent || '',
          index: charIndex
        });
      }
    });
    return entries;
  }
  buildTocHtml(entries) {
    return entries.map(e => {
      const indent = '  '.repeat(e.level - 1);
      return indent + "\u2022 " + e.text;
    }).join('\n');
  }
}