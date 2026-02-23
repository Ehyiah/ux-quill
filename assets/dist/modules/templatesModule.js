const DEFAULT_ICON = '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><rect class="ql-stroke" x="1" y="1" width="16" height="6" rx="1"/><rect class="ql-stroke" x="1" y="9" width="7" height="8" rx="1"/><rect class="ql-stroke" x="10" y="9" width="7" height="8" rx="1"/></svg>';
function isTemplateOption(item) {
  return typeof item === 'object' && item !== null && 'label' in item && 'content' in item;
}
function readIconFromToolbar(quill) {
  const toolbarOptions = quill.options?.modules?.toolbar;
  if (!Array.isArray(toolbarOptions)) {
    return null;
  }
  for (const group of toolbarOptions) {
    const items = Array.isArray(group) ? group : [group];
    for (const item of items) {
      if (typeof item === 'object' && item !== null && 'template' in item) {
        const val = item.template;
        return typeof val === 'string' ? val : null;
      }
    }
  }
  return null;
}
export class TemplatesModule {
  dropdown = null;
  constructor(quill, options) {
    // Defer setup so the toolbar buttons are guaranteed to exist,
    // regardless of Quill module initialization order.
    setTimeout(() => this.setup(quill, options), 0);
  }
  setup(quill, options) {
    const toolbar = quill.getModule('toolbar');
    if (!toolbar?.container) {
      return;
    }
    const btn = toolbar.container.querySelector('.ql-template');
    if (!btn) {
      return;
    }

    // Prevent Quill's toolbar from toggling the 'template' format on click
    toolbar.addHandler('template', () => {});
    const templates = this.normalizeOptions(options);
    const icon = readIconFromToolbar(quill);
    btn.innerHTML = icon ?? DEFAULT_ICON;
    btn.setAttribute('title', 'Templates');
    if (!templates.length) {
      return;
    }
    const wrapper = document.createElement('span');
    wrapper.style.cssText = 'position:relative;display:inline-block;';
    btn.parentElement.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);
    const dropdown = document.createElement('div');
    this.dropdown = dropdown;
    dropdown.style.cssText = ['display:none', 'position:absolute', 'top:100%', 'left:0', 'background:#fff', 'border:1px solid #ccc', 'border-radius:4px', 'box-shadow:0 2px 8px rgba(0,0,0,0.2)', 'z-index:9999', 'min-width:150px', 'padding:4px 0'].join(';');
    wrapper.appendChild(dropdown);
    templates.forEach(tpl => {
      const item = document.createElement('div');
      item.textContent = tpl.label;
      item.style.cssText = 'padding:6px 12px;cursor:pointer;white-space:nowrap;font-size:14px;';
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f0f0f0';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = '';
      });
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        const range = quill.getSelection(true);
        quill.clipboard.dangerouslyPasteHTML(range.index, tpl.content);
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(item);
    });
    btn.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('mousedown', e => {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
  normalizeOptions(options) {
    if (Array.isArray(options)) {
      return options.filter(isTemplateOption);
    }
    if (typeof options !== 'object' || options === null) {
      return [];
    }
    if ('label' in options && 'content' in options) {
      return [options];
    }

    // PHP may serialize sequential arrays as objects with numeric string keys {"0": {...}, "1": {...}}
    return Object.values(options).filter(isTemplateOption);
  }
}