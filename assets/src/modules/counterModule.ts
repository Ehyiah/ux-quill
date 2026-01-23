import Quill from 'quill';
import type { CountOptions } from '../types.d.ts';

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
        let container: HTMLDivElement | null = null;
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
            container.classList.add('quill-counter-container')
            this.quillContainer.parentElement?.appendChild(container);
        }

        return container;
    }

    private count(quill: Quill, container: HTMLDivElement, label: string, countFunction: (text: string) => number) {
        const updateCount = () => {
            const text = quill.getText();
            const value = countFunction(text);
            container.innerText = label + value;

            // Dispatch event with specific name based on label/function
            const type = countFunction === this.countWords ? 'words' : 'characters';
            this.dispatch(`counter:${type}-update`, { value });
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

    private dispatch(name: string, detail: any) {
        this.quillContainer.dispatchEvent(new CustomEvent(`quill:${name}`, {
            bubbles: true,
            cancelable: true,
            detail: detail
        }));
    }
}
