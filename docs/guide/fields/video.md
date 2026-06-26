# VideoField

**Auto-imported module:** `VideoSelectionModule` (automatically loaded when this field is used)

The `VideoField` adds a video button to the toolbar and enhances QuillJS’s default video handling, which is limited to inserting a simple, non-configurable embed. This implementation introduces advanced customization options such as sizing, improved rendering control, as well as SEO and accessibility optimizations.

Clicking it prompts for a video URL and inserts it into the editor as an embedded `<iframe>` wrapped in a `<figure>` with optional caption. The companion module adds a selection overlay, resize handles, alignment, and editing capabilities.

**QuillJS name:** `video`

## Companion module

`VideoSelectionModule` is automatically loaded. See the [full module documentation](/guide/modules/video-selection) for all available options.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;

'quill_options' => [
    QuillGroup::build(new VideoField()),
],
'modules' => [
    new VideoSelectionModule(options: [
        'borderColor' => '#007bff',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="videoSelection,counter"
    placeholder="Try inserting and editing videos…"
  />
</ClientOnly>
