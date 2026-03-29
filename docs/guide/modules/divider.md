# DividerModule

**Auto-imported: YES** (if `DividerField` is present in `quill_options`)

The Divider module allows users to insert horizontal lines into their content.
This module is automatically loaded if the `DividerField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

**Options:**
This module currently has no configuration options.

**Behavior:**
When the `divider` button is added to the toolbar, clicking it inserts a horizontal line at the current cursor position.

**Usage example:**

```php
'modules' => [
    new DividerModule(),
],
```

To enable the button in the toolbar:

```php
'quill_options' => [
    'toolbar' => [
        ['divider'],
        // ...
    ],
],
```
