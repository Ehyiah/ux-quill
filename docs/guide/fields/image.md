# ImageField

**Auto-imported module:** `ImageSelectionModule` (automatically loaded when this field is used)

The `ImageField` adds an image button to the toolbar. Clicking it prompts for an image URL and inserts it into the editor. The companion module adds selection overlays, resize handles, alignment, and editing capabilities.

**QuillJS name:** `image`

## Companion module

`ImageSelectionModule` is automatically loaded. See the [full module documentation](/guide/modules/image-selection) for all available options.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageSelectionModule;

'quill_options' => [
    QuillGroup::build(new ImageField()),
],
'modules' => [
    new ImageSelectionModule(options: [
        'borderColor' => '#007bff',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="imageSelection,counter"
    placeholder="Try inserting and editing images…"
  />
</ClientOnly>
