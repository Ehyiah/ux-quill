# ResizeModule

**Auto-imported: YES** (if `ImageField` is present in `quill_options`)

> **Deprecated:** This module will be removed in version 4.0. Use `ImageSelectionModule` instead.

The Resize module provides basic image resizing functionality. When an image is selected, resize handles appear at the corners, allowing the user to drag and resize the image.

This module is automatically loaded with default options when the `ImageField` is present. Pass it manually in the `modules` option to customize.

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| (custom) | `array` | `[]` | Module options (see quill-resize-image documentation) |

**Usage example:**

```php
'modules' => [
    new ResizeModule(options: [
        // custom options
    ]),
],
```

To use the legacy resize module instead of the new `ImageSelectionModule`:

```php
use Ehyiah\QuillJsBundle\DTO\Modules\ImageSelectionModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;

'modules' => [
    new ImageSelectionModule(['options' => false]), // Disable the new module
    new ResizeModule(), // Enable the legacy one
],
```
