function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
    var _quill$getContents$op;
    const quill = this.quill;
    const raw = this.extractHeaders(quill);
    if (raw.length === 0) return;
    const entries = raw.map(h => _extends({}, h, {
      id: this.generateId(h.text)
    }));
    const headers = quill.scroll.domNode.querySelectorAll('h1, h2, h3, h4, h5, h6');
    entries.forEach((entry, i) => {
      if (headers[i]) {
        headers[i].id = entry.id;
      }
    });
    const first = (_quill$getContents$op = quill.getContents(0, 1).ops) == null || (_quill$getContents$op = _quill$getContents$op[0]) == null ? void 0 : _quill$getContents$op.insert;
    if (first && typeof first === 'object' && 'toc' in first) {
      quill.updateContents([{
        delete: 1
      }]);
    }
    quill.insertEmbed(0, 'toc', entries, 'user');
    quill.updateContents([{
      retain: 1
    }, {
      insert: '\n'
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
          text: h.textContent || ''
        });
      }
    });
    return entries;
  }
  generateId(text) {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug + "-" + Math.random().toString(36).substring(2, 7);
  }
}