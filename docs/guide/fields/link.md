# LinkField

**Auto-imported module:** `LinkAttributesModule` (automatically loaded when this field is used)

The `LinkField` adds a link button to the toolbar. Clicking it prompts for a URL and wraps the selected text in a link. The companion module adds an edit tooltip when clicking existing links, letting the user toggle `target="_blank"` and `rel="nofollow"`.

**QuillJS name:** `link`

## Companion module

`LinkAttributesModule` is automatically loaded. See the [full module documentation](/guide/modules/link-attributes) for all available options.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LinkField;
use Ehyiah\QuillJsBundle\DTO\Modules\LinkAttributesModule;

'quill_options' => [
    QuillGroup::build(new LinkField()),
],
'modules' => [
    new LinkAttributesModule(options: [
        'openInNewTabLabel' => 'Ouvrir dans un nouvel onglet',
        'noFollowLabel' => 'Lien No-follow (SEO)',
        'saveButtonLabel' => 'Valider',
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="link"
    placeholder="Try inserting and editing a link…"
  />
</ClientOnly>
