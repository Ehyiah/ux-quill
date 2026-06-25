# PasteSanitizerModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

The PasteSanitizer module ensures that content pasted into the editor is clean and formatted as desired.

**Options:**
- **plain_text**: If true, content will always be pasted as plain text. Default: `true`.

**Behavior:**
When content is pasted into the editor, the module intercepts the paste event and processes the content based on the configuration. This is particularly useful for avoiding unwanted HTML from word processors like Word or Google Docs.

**Usage example:**

```php
'modules' => [
    new PasteSanitizerModule(options: [
        'plain_text' => true,
    ]),
],
```
