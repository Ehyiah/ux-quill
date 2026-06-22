import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');
const TYPE_CONFIG = {
  info: {
    label: 'Info',
    icon: '<span class="ql-callout-icon">&#8505;</span>',
    color: '#1a73e8',
    bg: '#e8f0fe',
    border: '#1a73e8'
  },
  warning: {
    label: 'Warning',
    icon: '<span class="ql-callout-icon">&#9888;</span>',
    color: '#e37400',
    bg: '#fef7e0',
    border: '#e37400'
  },
  danger: {
    label: 'Danger',
    icon: '<span class="ql-callout-icon">&times;</span>',
    color: '#d93025',
    bg: '#fce8e6',
    border: '#d93025'
  },
  success: {
    label: 'Success',
    icon: '<span class="ql-callout-icon">&#10003;</span>',
    color: '#188038',
    bg: '#e6f4ea',
    border: '#188038'
  }
};
class CalloutBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const type = (value == null ? void 0 : value.type) || 'info';
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    node.classList.add("ql-callout--" + type);
    node.dataset.calloutType = type;
    node.style.borderLeft = "4px solid " + cfg.border;
    node.style.backgroundColor = cfg.bg;
    node.style.borderRadius = '8px';
    node.style.padding = '0';
    node.style.margin = '12px 0';
    const header = document.createElement('div');
    header.className = 'ql-callout-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '8px';
    header.style.padding = '10px 14px 0';
    header.style.fontWeight = '600';
    header.style.fontSize = '13px';
    header.style.textTransform = 'uppercase';
    header.style.letterSpacing = '0.5px';
    header.style.color = cfg.color;
    header.innerHTML = cfg.icon + " " + cfg.label;
    const content = document.createElement('div');
    content.className = 'ql-callout-content';
    content.style.padding = '8px 14px 12px';
    content.style.minHeight = '1em';
    content.innerHTML = (value == null ? void 0 : value.content) || '<p><br></p>';
    node.appendChild(header);
    node.appendChild(content);
    return node;
  }
  attach() {
    super.attach();
    const header = this.domNode.querySelector('.ql-callout-header');
    if (header) header.contentEditable = 'false';
  }
  static value(node) {
    const contentEl = node.querySelector('.ql-callout-content');
    return {
      type: node.dataset.calloutType || 'info',
      content: contentEl ? contentEl.innerHTML : ''
    };
  }
}
CalloutBlot.blotName = 'callout';
CalloutBlot.tagName = 'div';
CalloutBlot.className = 'ql-callout';
export default CalloutBlot;