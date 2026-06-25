# HistoryModule

**Auto-imported: NO**

The History module manages undo and redo operations in the editor. It is a built-in Quill module that is enabled by default even without explicit configuration.

This module does not need to be added manually unless you want to customize its options. See the [Quill History module documentation](https://quilljs.com/docs/modules/history) for more details.

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `delay` | `string` | `'1000'` | Delay in milliseconds before changes are stacked |
| `maxStack` | `string` | `'100'` | Maximum number of changes kept in the history |
| `userOnly` | `string` | `'false'` | Only track user-initiated changes |

**Usage example:**

```php
'modules' => [
    new HistoryModule(options: [
        'delay' => '500',
        'maxStack' => '200',
    ]),
],
```
