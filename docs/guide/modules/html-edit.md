# HtmlEditModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

The HtmlEdit module allows users to view and edit the raw HTML source code of the editor content.

**Options:**
- **debug**: Enable debug logging. Default: `false`.
- **msg**: The message displayed in the modal. Default: `'Edit html source'`.
- **okText**: The text for the confirm button. Default: `'Save'`.
- **cancelText**: The text for the cancel button. Default: `'Cancel'`.
- **buttonHTML**: The HTML content for the button. Default: `'&lt;&gt;'`.
- **buttonTitle**: The title for the button. Default: `'Html source'`.
- **closeOnClickOverlay**: Whether to close the modal when clicking the overlay. Default: `false`.
- **prependSelector**: A selector to prepend the modal to. Default: `body`.
- **syntax**: Enable syntax highlighting in the modal. Default: `false`.

**Behavior:**
Adds a button to the toolbar (if configured) that opens a modal containing the HTML source code of the editor.

**Usage example:**

```php
'modules' => [
    new HtmlEditModule(options: [
        'buttonTitle' => 'Source HTML',
        'okText' => 'Enregistrer',
        'cancelText' => 'Annuler',
    ]),
],
```

To enable the button in the toolbar:

```php
'quill_options' => [
    'toolbar' => [
        ['htmlEditButton'],
        // ...
    ],
],
```
