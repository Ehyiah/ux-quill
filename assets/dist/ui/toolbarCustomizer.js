import Quill from 'quill';
export class ToolbarCustomizer {
  /**
   * @param customIcons Objet contenant les nouveaux SVG par nom d'icône
   * @param container Élément conteneur pour limiter la recherche (facultatif)
   */
  static customizeIcons(customIcons, container) {
    if (!customIcons || Object.keys(customIcons).length === 0) {
      return;
    }
    setTimeout(() => {
      const toolbars = container ? container.querySelector('.ql-toolbar') ? [container.querySelector('.ql-toolbar')] : [] : Array.from(document.querySelectorAll('.ql-toolbar'));
      if (toolbars.length === 0) return;
      toolbars.forEach(toolbar => {
        const buttons = toolbar.querySelectorAll('button');
        buttons.forEach(button => {
          const ariaLabel = button.getAttribute('aria-label');
          const classMatch = Array.from(button.classList).find(cls => cls.startsWith('ql-'))?.replace('ql-', '');
          let svgContent;

          // 1. search by aria-label
          if (ariaLabel && customIcons[ariaLabel]) {
            svgContent = customIcons[ariaLabel];
          }
          // 2. search by ql-class
          else if (classMatch && customIcons[classMatch]) {
            svgContent = customIcons[classMatch];
          }
          if (svgContent) {
            const existingSvg = button.querySelector('svg');
            if (existingSvg) {
              existingSvg.remove();
            }
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgContent.trim();
            const newSvg = tempDiv.firstChild;
            if (newSvg) {
              if (!newSvg.hasAttribute('width')) newSvg.setAttribute('width', '18');
              if (!newSvg.hasAttribute('height')) newSvg.setAttribute('height', '18');
              button.prepend(newSvg);
            }
          }
        });
      });
    }, 0);
  }

  /**
   * Try to personalize icons from quill registry first and return unprocessed icons.
   *
   * @param customIcons Objet contenant les nouveaux SVG par nom d'icône
   *
   * @returns Icônes qui n'ont pas pu être traitées par le registre global
   */
  static customizeIconsFromQuillRegistry(customIcons) {
    if (!customIcons || Object.keys(customIcons).length === 0) {
      return {};
    }
    const icons = Quill.import('ui/icons');
    const unprocessedIcons = {};
    Object.keys(customIcons).forEach(iconName => {
      if (icons[iconName] !== undefined) {
        icons[iconName] = customIcons[iconName];
      } else {
        unprocessedIcons[iconName] = customIcons[iconName];
      }
    });
    return unprocessedIcons;
  }
  static debugToolbarButtons(container) {
    setTimeout(() => {
      const toolbars = container ? container.querySelector('.ql-toolbar') ? [container.querySelector('.ql-toolbar')] : [] : Array.from(document.querySelectorAll('.ql-toolbar'));
      toolbars.forEach((toolbar, i) => {
        console.group(`Toolbar #${i + 1}`);
        toolbar.querySelectorAll('button').forEach((btn, j) => {
          console.log(`Button #${j + 1}:`, {
            class: Array.from(btn.classList).join(', '),
            ariaLabel: btn.getAttribute('aria-label'),
            value: btn.getAttribute('value'),
            html: btn.outerHTML
          });
        });
        console.groupEnd();
      });
    }, 100);
  }
}