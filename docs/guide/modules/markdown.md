# MarkdownModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

This module enables Markdown shortcuts directly in the editor while typing. When you type a specific sequence followed by a space or enter, it will automatically format the current line.

**Available shortcuts:**
- `# ` to `###### `: Creates headers (H1 to H6).
- `* ` or `- `: Creates a bulleted list.
- `1. `: Creates an ordered list.
- `> `: Creates a blockquote.

**Usage example:**

```php
'modules' => [
    new MarkdownModule(),
],
```
