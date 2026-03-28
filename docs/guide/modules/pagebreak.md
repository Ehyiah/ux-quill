# PageBreakModule

This module adds support for page breaks. It displays a visual indicator in the editor and applies a `page-break-after: always` rule when printing.

<img src="/modules/pagebreak/image.png" alt="image selection">


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
