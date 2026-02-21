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
        const clipboard = this.quill.getModule('clipboard');
        if (!clipboard) return;

        // @ts-ignore
        clipboard.addMatcher(Node.ELEMENT_NODE, (node: HTMLElement, delta: any) => {
            // If plain text is requested, we strip everything except basic text
            if (this.options.plain_text) {
                const ops = delta.ops.map((op: any) => {
                    if (typeof op.insert === 'string') {
                        return { insert: op.insert };
                    }
                    return { insert: '' };
                });
                return new Delta(ops);
            }
            // If plain_text is false, let Quill handle it normally,
            // or apply default cleaning if needed (but user requested to remove other options)
            return delta;
        });
    }
}
