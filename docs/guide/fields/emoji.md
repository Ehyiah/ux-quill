# EmojiField

**Auto-imported module:** `EmojiModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/emoji) for details.

The `EmojiField` adds an emoji picker button to the toolbar. Clicking it opens a popup with emoji categories, letting the user insert emojis into the editor.

**QuillJS name:** `emoji`

Powered by [quill2-emoji](https://github.com/contentco/quill-emoji).

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;

'quill_options' => [
    QuillGroup::build(new EmojiField()),
],
'modules' => [
    new EmojiModule(), // auto-imported, but can be added manually
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="emoji"
    placeholder="Try inserting an emoji…"
  />
</ClientOnly>
