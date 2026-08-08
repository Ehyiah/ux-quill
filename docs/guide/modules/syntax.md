# SyntaxModule

**Auto-imported: YES** (if [`CodeBlockField`](/guide/fields/code-block) is present in `quill_options`)

The Syntax module adds syntax highlighting to code blocks in the editor. It uses [highlight.js](https://highlightjs.org/) to colorize code when the editor content is rendered.

This module is automatically loaded if the `CodeBlockField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

See the [Quill Syntax module documentation](https://quilljs.com/docs/modules/syntax/) for more details.

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| — | `string` | `'true'` | Enabled with default settings by passing `'true'` |

**Usage example:**

```php
'quill_options' => [
    'toolbar' => [
        ['code-block'],
        // ...
    ],
],
'modules' => [
    new SyntaxModule(),
],
```
