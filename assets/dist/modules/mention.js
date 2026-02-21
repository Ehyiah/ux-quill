import Quill from 'quill';
import MentionBlot from "../blots/mention.js";
Quill.register(MentionBlot);
export class Mention {
  quill;
  options;
  list = null;
  selectedIndex = 0;
  currentSearch = '';
  currentResults = [];
  startSelection = null;
  constructor(quill, options) {
    this.quill = quill;
    this.options = {
      trigger: '@',
      data: [],
      remote_url: null,
      min_chars: 0,
      max_results: 10,
      ...options
    };
    this.injectStyles();
    this.quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        setTimeout(() => this.handleTextChange(), 0);
      }
    });
    this.quill.root.addEventListener('keydown', ev => this.handleKeyDown(ev), true);
    this.quill.on('selection-change', range => {
      if (!range) this.hideList();
    });

    // Hide list on scroll (anywhere)
    window.addEventListener('scroll', () => this.hideList(), true);
  }
  async handleTextChange() {
    const selection = this.quill.getSelection();
    if (!selection || selection.length > 0) {
      this.hideList();
      return;
    }
    const [line, offset] = this.quill.getLine(selection.index);
    if (!line) {
      this.hideList();
      return;
    }
    const lineIndex = this.quill.getIndex(line);
    const textBefore = this.quill.getText(lineIndex, offset);
    const triggerIndex = textBefore.lastIndexOf(this.options.trigger);
    if (triggerIndex !== -1) {
      const charBeforeTrigger = triggerIndex > 0 ? textBefore[triggerIndex - 1] : '';
      const isStartOrSpace = triggerIndex === 0 || charBeforeTrigger === ' ' || charBeforeTrigger === '\n' || charBeforeTrigger === '\t';
      if (isStartOrSpace) {
        const query = textBefore.substring(triggerIndex + 1);
        if (!query.includes(' ')) {
          if (query.length >= this.options.min_chars) {
            this.startSelection = lineIndex + triggerIndex;
            this.currentSearch = query;
            await this.showList();
            return;
          }
        }
      }
    }
    this.hideList();
  }
  async showList() {
    let items = this.options.data || [];
    if (this.options.remote_url) {
      try {
        const url = this.options.remote_url.replace('{query}', encodeURIComponent(this.currentSearch));
        const response = await fetch(url);
        items = await response.json();
      } catch (e) {
        console.error('Mention search failed:', e);
      }
    } else {
      items = items.filter(i => i.value.toLowerCase().includes(this.currentSearch.toLowerCase()));
    }
    this.currentResults = items.slice(0, this.options.max_results);
    if (this.currentResults.length === 0) {
      this.hideList();
      return;
    }
    this.renderList();
  }
  renderList() {
    if (!this.list) {
      this.list = document.createElement('div');
      this.list.className = 'ql-mention-list';
      document.body.appendChild(this.list);
    }
    this.list.innerHTML = '';
    this.currentResults.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `ql-mention-item ${index === this.selectedIndex ? 'selected' : ''}`;
      div.innerText = item.value;
      div.addEventListener('mousedown', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        this.selectItem(item);
      });
      this.list?.appendChild(div);
    });
    const range = this.quill.getSelection();
    if (range) {
      const bounds = this.quill.getBounds(range.index);
      const containerBounds = this.quill.container.getBoundingClientRect();
      if (bounds && containerBounds) {
        const top = containerBounds.top + bounds.top + bounds.height + 5;
        const left = containerBounds.left + bounds.left;
        this.list.style.position = 'fixed';
        this.list.style.top = `${top}px`;
        this.list.style.left = `${left}px`;
        this.list.style.display = 'block';
      }
    }
  }
  selectItem(item) {
    if (this.startSelection === null) return;
    const range = this.quill.getSelection();
    if (!range) return;
    const lengthToDelete = range.index - this.startSelection;
    this.quill.deleteText(this.startSelection, lengthToDelete, 'user');
    this.quill.insertEmbed(this.startSelection, 'mention', {
      id: item.id,
      value: item.value,
      trigger: this.options.trigger
    }, 'user');
    this.quill.insertText(this.startSelection + 1, ' ', 'user');
    this.quill.setSelection(this.startSelection + 2, 'user');
    this.hideList();
  }
  handleKeyDown(ev) {
    if (!this.list || this.list.style.display === 'none') return;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
      this.renderList();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
      this.renderList();
    } else if (ev.key === 'Enter' || ev.key === 'Tab') {
      ev.preventDefault();
      if (this.currentResults[this.selectedIndex]) {
        this.selectItem(this.currentResults[this.selectedIndex]);
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      this.hideList();
    }
  }
  hideList() {
    if (this.list) {
      this.list.style.display = 'none';
    }
    this.selectedIndex = 0;
  }
  injectStyles() {
    const id = 'quill-mention-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
            .ql-mention {
                background-color: #e1f5fe;
                color: #01579b;
                border-radius: 4px;
                padding: 0 4px;
                font-weight: bold;
                display: inline-block;
            }
            .ql-mention-list {
                position: fixed;
                background: #fff;
                border: 1px solid #ddd;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-radius: 4px;
                z-index: 9999;
                min-width: 180px;
                display: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                overflow: hidden;
            }
            .ql-mention-item {
                padding: 10px 15px;
                cursor: pointer;
                font-size: 14px;
                color: #333;
                transition: background 0.1s;
            }
            .ql-mention-item:hover, .ql-mention-item.selected {
                background-color: #e3f2fd;
                color: #1976d2;
            }
        `;
    document.head.appendChild(style);
  }
}