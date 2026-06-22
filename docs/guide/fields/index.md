# Fields (toolbar buttons)

Fields are the toolbar buttons you can add to the Quill editor. They define what the user sees in the toolbar and what actions they can perform.

## How it works

In the PHP form builder, you build a toolbar by grouping fields together via `QuillGroup::build()`:

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;

QuillGroup::build(
    new BoldField(),
    new ItalicField(),
)
```

## Field types

Fields come in two categories:

- **Inline fields**: Toolbar buttons for inline formatting (bold, italic, link, image, etc.)
- **Block fields**: Toolbar buttons for block-level formatting (headers, lists, etc.)

## Field-dependent modules

Some fields **automatically import** a companion module when they are used. For example, `TableField` automatically loads `TableModule`, and `EmojiField` automatically loads `EmojiModule`. These fields implement `QuillFieldModuleInterface`.

The following pages document these **field-dependent** toolbar buttons and let you try them live.
