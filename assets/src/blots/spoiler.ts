import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class SpoilerBlot extends BlockEmbed {
    static blotName = 'spoiler';
    static tagName = 'details';
    static className = 'ql-spoiler';

    static create(value: { title: string; content: string }) {
        const node = super.create();

        const summary = document.createElement('summary');
        summary.className = 'ql-spoiler-summary';
        summary.contentEditable = 'true';
        summary.textContent = value.title || 'Spoiler';
        node.appendChild(summary);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ql-spoiler-content';
        contentDiv.contentEditable = 'true';
        contentDiv.innerHTML = value.content || '';
        node.appendChild(contentDiv);

        return node;
    }

    attach() {
        super.attach();
        (this.domNode as HTMLDetailsElement).open = true;

        this.domNode.querySelector('.ql-spoiler-summary')?.addEventListener('click', (e: Event) => {
            e.preventDefault();
        });

        this.domNode.addEventListener('toggle', (e: Event) => {
            (e.target as HTMLDetailsElement).open = true;
        });
    }

    static value(node: HTMLElement) {
        const details = node as HTMLDetailsElement;
        const summary = details.querySelector('.ql-spoiler-summary');
        const contentDiv = details.querySelector('.ql-spoiler-content');
        return {
            title: summary?.textContent || '',
            content: contentDiv?.innerHTML || '',
        };
    }
}

export default SpoilerBlot;
