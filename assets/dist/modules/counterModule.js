export class Counter {
  quillContainer;
  wordsContainer;
  charactersContainer;
  charactersLabel;
  wordsLabel;
  constructor(quill, options) {
    this.quillContainer = quill.options.container;
    this.wordsLabel = options.words_label ?? 'Number of words: ';
    this.charactersLabel = options.characters_label ?? 'Number of characters: ';
    if (options.words) {
      this.wordsContainer = this.createContainer(options.words_container);
      this.count(quill, this.wordsContainer, this.wordsLabel, this.countWords);
    }
    if (options.characters) {
      this.charactersContainer = this.createContainer(options.characters_container);
      this.count(quill, this.charactersContainer, this.charactersLabel, this.countCharacters);
    }
  }
  createContainer(containerId) {
    let container;
    if (containerId) {
      try {
        container = document.querySelector('#' + containerId);
      } catch (e) {
        console.warn(`Container with id "${containerId}" not found. Creating a new one.`);
      }
    }
    if (!container) {
      container = document.createElement('div');
      container.style.border = '1px solid #ccc';
      container.style.borderWidth = '0px 1px 1px 1px';
      container.style.padding = '5px 15px';
      container.classList.add('quill-counter-container');
      this.quillContainer.parentElement?.appendChild(container);
    }
    return container;
  }
  count(quill, container, label, countFunction) {
    const updateCount = () => {
      const text = quill.getText();
      container.innerText = label + countFunction(text);
    };
    updateCount();
    quill.on('text-change', updateCount);
  }
  countWords(text) {
    return text.split(/\s+/).filter(Boolean).length;
  }
  countCharacters(text) {
    return text.length;
  }
}