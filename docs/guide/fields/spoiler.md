# SpoilerField

**Auto-imported module:** `SpoilerModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/spoiler) for details.

The `SpoilerField` adds a collapsible spoiler/accordion block button to the toolbar. Clicking it inserts a `<details><summary>...</summary>...</details>` element at the cursor position.

**QuillJS name:** `spoiler`

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\SpoilerField;

'quill_options' => [
    QuillGroup::build(new SpoilerField()),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="spoiler"
    placeholder="Try inserting a spoiler block…"
  />
</ClientOnly>
