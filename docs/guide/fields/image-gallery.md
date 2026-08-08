# ImageGalleryField

**Auto-imported module:** `ImageGalleryModule` (automatically loaded when this field is used)

The `ImageGalleryField` adds a gallery button to the toolbar. Clicking it opens a media gallery modal where the user can browse, search, and upload images, then insert them directly into the editor.

**QuillJS name:** `imageGallery`

## Configuration

The companion `ImageGalleryModule` requires at least a `listEndpoint`. See the [full module documentation](/guide/modules/image-gallery) for all available options.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageGalleryField;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageGalleryModule;

'quill_options' => [
    QuillGroup::build(new ImageGalleryField()),
],
'modules' => [
    new ImageGalleryModule(options: [
        'listEndpoint' => '/api/media/list',
        'searchEndpoint' => '/api/media/search',
        'uploadEndpoint' => '/api/media/upload',
        'buttonTitle' => 'Browse Media Library',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="imageGallery"
    placeholder="Try opening the gallery and inserting an image…"
  />
</ClientOnly>
