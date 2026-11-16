import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

interface TocEntryData {
  id: string;
  level: number;
  text: string;
}

class TocBlot extends BlockEmbed {
  static blotName = 'toc';
  static tagName = 'div';
  static className = 'table-of-contents';

  static create(value: TocEntryData[]) {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');

    const list = document.createElement('ol');
    value.forEach((entry) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${entry.id}`;
      a.textContent = entry.text;
      a.tabIndex = -1;
      li.appendChild(a);
      list.appendChild(li);
    });
    node.appendChild(list);

    return node;
  }

  static value(node: HTMLElement) {
    return Array.from(node.querySelectorAll('a')).map((a) => ({
      id: a.getAttribute('href')?.slice(1) || '',
      text: a.textContent || '',
    }));
  }
}

export default TocBlot;
