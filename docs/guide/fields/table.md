# TableField

**Auto-imported module:** `TableModule` (automatically loaded when this field is used)

The `TableField` adds an advanced table button to the toolbar. Clicking it lets the user insert and manage complex tables with cell merging, row/column operations, and more.

**QuillJS name:** `table-better`

Powered by [quill-table-better](https://github.com/attoae/quill-table-better).

## Options

The companion `TableModule` accepts the following options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `menus` | `string[]` | `['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete']` | Which table context menus to show |
| `toolbarTable` | `string` | `'true'` | Show the table toolbar when a cell is selected |
| `language` | `string` | `'en_US'` | UI language (`en_US`, `fr_FR`, `zh_CN`, `pl_PL`, `ru_RU`, `de_DE`, `tr_TR`) |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TableField;
use Ehyiah\QuillJsBundle\DTO\Modules\TableModule;

'quill_options' => [
    QuillGroup::build(new TableField()),
],
'modules' => [
    new TableModule(options: [
        'menus' => ['column', 'row', 'merge', 'table', 'cell'],
        'language' => 'fr_FR',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="table"
    placeholder="Try inserting and editing a table…"
  />
</ClientOnly>
