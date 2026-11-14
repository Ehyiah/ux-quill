import { serializeContent, serializeHtml } from '../src/utils/serializeContent';

describe('serializeContent', () => {
    it('removes table selection classes from the saved HTML', () => {
        const root = document.createElement('div');
        root.innerHTML = '<table><tbody><tr><td class="ql-cell-focused ql-cell-selected">Cell</td></tr></tbody></table>';

        expect(serializeContent(root)).toBe('<table><tbody><tr><td>Cell</td></tr></tbody></table>');
    });

    it('also cleans semantic HTML', () => {
        expect(serializeHtml('<table><tbody><tr><td class="ql-cell-focused">Cell</td></tr></tbody></table>')).toBe(
            '<table><tbody><tr><td>Cell</td></tr></tbody></table>'
        );
    });
});
