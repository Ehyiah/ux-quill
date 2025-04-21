import Quill from 'quill';
export class ToolbarCustomizer {
  static customizeIcons(customIcons) {
    if (!customIcons || Object.keys(customIcons).length === 0) {
      return;
    }
    const icons = Quill.import('ui/icons');
    Object.keys(customIcons).forEach(iconName => {
      if (icons[iconName] !== undefined) {
        icons[iconName] = customIcons[iconName];
      } else {
        console.warn("icon \"" + iconName + "\" is not existing. please check icon name");
      }
    });
  }
}