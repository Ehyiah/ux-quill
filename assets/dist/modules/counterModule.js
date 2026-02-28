export class Counter {
  constructor(quill, options) {
    var _options$words_label, _options$characters_l;
    this.quillContainer = void 0;
    this.wordsContainer = void 0;
    this.charactersContainer = void 0;
    this.charactersLabel = void 0;
    this.wordsLabel = void 0;
    this.quillContainer = quill.options.container;
    this.wordsLabel = (_options$words_label = options.words_label) != null ? _options$words_label : 'Number of words: ';
    this.charactersLabel = (_options$characters_l = options.characters_label) != null ? _options$characters_l : 'Number of characters: ';
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
    let container = null;
    if (containerId) {
      try {
        container = document.querySelector('#' + containerId);
      } catch (e) {
        console.warn("Container with id \"" + containerId + "\" not found. Creating a new one.");
      }
    }
    if (!container) {
      var _this$quillContainer$;
      container = document.createElement('div');
      container.style.border = '1px solid #ccc';
      container.style.borderWidth = '0px 1px 1px 1px';
      container.style.padding = '5px 15px';
      container.classList.add('quill-counter-container');
      (_this$quillContainer$ = this.quillContainer.parentElement) == null || _this$quillContainer$.appendChild(container);
    }
    return container;
  }
  count(quill, container, label, countFunction) {
    const updateCount = () => {
      const text = quill.getText();
      const value = countFunction(text);
      container.innerText = label + value;

      // Dispatch event with specific name based on label/function
      const type = countFunction === this.countWords ? 'words' : 'characters';
      this.dispatch("counter:" + type + "-update", {
        value
      });
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
  dispatch(name, detail) {
    this.quillContainer.dispatchEvent(new CustomEvent("quill:" + name, {
      bubbles: true,
      cancelable: true,
      detail: detail
    }));
  }
}