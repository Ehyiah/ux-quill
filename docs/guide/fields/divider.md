# DividerField

**Auto-imported module:** `DividerModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/divider) for details.

The `DividerField` adds a horizontal line button to the toolbar. Clicking it inserts a thematic break (`<hr>`) at the cursor position.

**QuillJS name:** `divider`

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\DividerField;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;

'quill_options' => [
    QuillGroup::build(new DividerField()),
],
'modules' => [
    new DividerModule(), // auto-imported, but can be added manually
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="divider"
    placeholder="Try inserting a divider…"
  />
</ClientOnly>
