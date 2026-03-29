# PageBreakModule

**Auto-imported: YES** (if `PageBreakField` is present in `quill_options`)

This module adds support for page breaks. It displays a visual indicator in the editor and applies a `page-break-after: always` rule when printing.
This module is automatically loaded if the `PageBreakField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

**Options:**
- **label**: The text displayed on the page break line (default: `'Page Break'`)

**Usage example:**

```php
'modules' => [
    new PageBreakModule([
        'label' => 'Page Break',
    ]),
],
```
