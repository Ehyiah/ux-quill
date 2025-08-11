export class PlaceholderModule {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.placeholders = options.placeholders || [];
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      this.addButton(toolbar);
    }
  }

  // Ajoute le bouton "placeholder" à la barre d'outils
  addButton(toolbar) {
    const button = document.createElement('button');
    button.innerHTML = 'Placeholders';
    button.className = 'ql-placeholder';
    button.title = 'Insérer un placeholder';
    button.onclick = () => {
      this.toggleDropdown();
    };
    const container = toolbar.container.querySelector('.ql-formats');
    if (container) {
      container.appendChild(button);
    }

    // Créer le menu déroulant
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ql-placeholder-dropdown';
    this.dropdown.style.display = 'none';
    this.placeholders.forEach(ph => {
      const item = document.createElement('div');
      item.className = 'ql-placeholder-item';
      item.innerHTML = ph;
      item.onclick = () => {
        this.insertPlaceholder(ph);
        this.toggleDropdown();
      };
      this.dropdown.appendChild(item);
    });
    toolbar.container.appendChild(this.dropdown);
  }

  // Affiche ou cache le menu déroulant
  toggleDropdown() {
    this.dropdown.style.display = this.dropdown.style.display === 'none' ? 'block' : 'none';
  }

  // Insère le placeholder dans l'éditeur
  insertPlaceholder(placeholder) {
    const range = this.quill.getSelection(true);
    if (range) {
      this.quill.insertText(range.index, `{{${placeholder}}}`);
      this.quill.setSelection(range.index + placeholder.length + 4, 0);
    }
  }
}