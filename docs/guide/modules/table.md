# TableModule

**Auto-imported: YES** (if `TableField` is present in `quill_options`)

The Table module adds advanced table support to the editor. It allows inserting tables, merging cells, managing rows and columns, and more.

This module is automatically loaded if the `TableField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

Powered by [quill-table-better](https://github.com/attoae/quill-table-better). See the repository for full documentation and advanced options.

**Options:**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `menus` | `string[]` | `['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete']` | Which table context menus to show |
| `toolbarTable` | `string` | `'true'` | Show the table toolbar when a cell is selected |
| `language` | `string` | `'en_US'` | UI language (`en_US`, `fr_FR`, `zh_CN`, `pl_PL`, `ru_RU`, `de_DE`, `tr_TR`) |
| `whiteList` | `string[]` | `[]` | Allowed table operations (when empty, all are allowed) |
| `singleWhiteList` | `string[]` | `[]` | Allowed operations when only one cell is selected |

**Behavior:**

When the `table-better` button is clicked in the toolbar, a table is inserted at the cursor position. Right-clicking on a table cell opens a context menu with options to insert, delete, or merge cells, rows, and columns. When a cell is selected, a floating toolbar appears with additional formatting options.

**Usage example:**

```php
'quill_options' => [
    'toolbar' => [
        ['table-better'],
        // ...
    ],
],
'modules' => [
    new TableModule(options: [
        'menus' => ['column', 'row', 'merge', 'table', 'cell'],
        'language' => 'fr_FR',
    ]),
],
```
