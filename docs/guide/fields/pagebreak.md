# PageBreakField

**Auto-imported module:** `PageBreakModule` (automatically loaded when this field is used)

The `PageBreakField` adds a page break button to the toolbar. Clicking it inserts a visual page break indicator in the editor. When printing, the content after the break starts on a new page.

**QuillJS name:** `pageBreak`

## Options

The companion `PageBreakModule` accepts the following option:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | `'Page Break'` | Text displayed on the page break line |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\PageBreakField;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;

'quill_options' => [
    QuillGroup::build(new PageBreakField()),
],
'modules' => [
    new PageBreakModule(options: [
        'label' => 'Page Break',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="pageBreak"
    placeholder="Try inserting a page break…"
  />
</ClientOnly>
