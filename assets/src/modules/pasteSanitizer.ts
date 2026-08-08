import Quill from 'quill';

const Delta = Quill.import('delta');

type PasteSanitizerOptions = {
    plain_text: boolean;
};

export class PasteSanitizer {
    private quill: Quill;
    private options: PasteSanitizerOptions;

    constructor(quill: Quill, options: PasteSanitizerOptions) {
        this.quill = quill;
        this.options = {
            plain_text: false,
            ...options
        };

        this.init();
    }

    private init(): void {
        this.quill.root.addEventListener('paste', this.handlePaste.bind(this));
    }

    private handlePaste(event: ClipboardEvent): void {
        if (!this.options.plain_text) {
            return;
        }

        event.preventDefault(); // Prevent Quill's default paste handling

        const clipboardData = event.clipboardData || (window as any).clipboardData;
        const text = clipboardData.getData('text/plain');

        if (text) {
            const selection = this.quill.getSelection();
            if (selection) {
                // Insert plain text at the current cursor position
                this.quill.clipboard.dangerouslyPasteHTML(selection.index, text);
            } else {
                // If no selection, insert at the end
                this.quill.clipboard.dangerouslyPasteHTML(this.quill.getLength(), text);
            }
        }
    }
}
