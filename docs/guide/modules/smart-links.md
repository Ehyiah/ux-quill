# SmartLinksModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

This module automatically detects and converts URLs into clickable links as the user types.

**Options:**
- **linkRegex**: The regular expression used to detect links. Default: `'/https?:\/\/[^\s]+/'`.

**Behavior:**
When a user finishes typing a URL (by pressing Space, Enter, or Tab), the module checks if the text matches the `linkRegex`. If it does, the text is automatically converted into a link.

**Usage example:**

```php
'modules' => [
    new SmartLinksModule(options: [
        'linkRegex' => '/https?:\/\/[^\s]+/',
    ]),
],
```
