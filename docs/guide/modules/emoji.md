# EmojiModule

**Auto-imported: YES** (if `EmojiField` is present in `quill_options`)

The Emoji module adds an emoji picker to the editor. When the emoji toolbar button is clicked, a popup opens with categorized emojis that the user can select to insert into the content.

This module is automatically loaded if the `EmojiField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

Powered by [quill2-emoji](https://github.com/contentco/quill-emoji). See the repository for full documentation.

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| — | `string` | `'true'` | Enabled with default settings by passing `'true'` |

**Usage example:**

```php
'quill_options' => [
    'toolbar' => [
        ['emoji'],
        // ...
    ],
],
'modules' => [
    new EmojiModule(),
],
```
