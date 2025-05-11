import Quill from 'quill';

type CountOptions = {
    words?: boolean;
    words_label?: string;
    words_container?: string;
    characters?: boolean;
    characters_label?: string;
    characters_container?: string;
}

export class Counter {
    quillContainer: HTMLElement;
    wordsContainer: HTMLDivElement | null;
    charactersContainer: HTMLDivElement | null;
    charactersLabel: string;
    wordsLabel: string;

    constructor(quill: Quill, options: CountOptions) {
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

    private createContainer(containerId: string | undefined): HTMLDivElement {
        let container: HTMLDivElement | null;
        if (containerId) {
            try {
                container = document.querySelector('#' + containerId);
            } catch (e) {
                console.warn(`Container with id "${containerId}" not found. Creating a new one.`);
            }
        }

        if (!container) {
            container = document.createElement('div');
            container.style.border = '1px solid #ccc'
            container.style.borderWidth = '0px 1px 1px 1px'
            container.style.padding = '5px 15px'
            this.quillContainer.parentElement?.appendChild(container);
        }

        return container;
    }

    private count(quill: Quill, container: HTMLDivElement, label: string, countFunction: (text: string) => number) {
        const updateCount = () => {
            const text = quill.getText();
            container.innerText = label + countFunction(text);
        };

        updateCount();

        quill.on('text-change', updateCount);
    }

    private countWords(text: string): number {
        return text.split(/\s+/).filter(Boolean).length;
    }

    private countCharacters(text: string): number {
        return text.length;
    }
}
