# LayoutField

**Auto-imported module:** `LayoutModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/layout) for details.

The `LayoutField` adds a multi-column layout button to the toolbar. Clicking it opens a preset picker where users can choose between column arrangements (50/50, 30/70, 70/30, 3 columns). Selecting a preset inserts a grid-based multi-column section at the cursor position.

**QuillJS name:** `layout`

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LayoutField;
use Ehyiah\QuillJsBundle\DTO\Modules\LayoutModule;

'quill_options' => [
    QuillGroup::build(new LayoutField()),
],
'modules' => [
    new LayoutModule(), // auto-imported, but can be added manually
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="layout"
    placeholder="Try inserting a multi-column layout…"
  />
</ClientOnly>
