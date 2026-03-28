# CounterModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

The Counter module provides real-time word and character counts for the editor content.

**Options:**
- **words**: Whether to show the word count. Default: `true`.
- **words_label**: Label for the word count. Default: `'Number of words : '`.
- **words_container**: The ID of an HTML element to use as the container for the word count. If empty, a default container is created at the bottom of the editor.
- **characters**: Whether to show the character count. Default: `true`.
- **characters_label**: Label for the character count. Default: `'Number of characters : '`.
- **characters_container**: The ID of an HTML element to use as the container for the character count. If empty, a default container is created at the bottom of the editor.

**Behavior:**
Counts are updated automatically as the user types.

**Usage example:**

```php
'modules' => [
    new CounterModule(options: [
        'words' => true,
        'words_label' => 'Mots : ',
        'characters' => true,
        'characters_label' => 'Caractères : ',
    ]),
],
```
