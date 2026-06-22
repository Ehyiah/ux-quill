# Text Formatting Fields

Standard inline formatting fields for bold, italic, underline, strikethrough, code, blockquote, and clean formatting.

| Field | QuillJS name | Description |
| --- | --- | --- |
| `BoldField` | `bold` | Bold text |
| `ItalicField` | `italic` | Italic text |
| `UnderlineField` | `underline` | Underlined text |
| `StrikeField` | `strike` | Strikethrough text |
| `CodeField` | `code` | Inline code |
| `BlockQuoteField` | `blockquote` | Block quote |
| `CleanField` | `clean` | Remove formatting |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\StrikeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BlockQuoteField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CleanField;

'quill_options' => [
    QuillGroup::build(
        new BoldField(),
        new ItalicField(),
        new UnderlineField(),
        new StrikeField(),
    ),
    QuillGroup::build(
        new CodeField(),
        new BlockQuoteField(),
    ),
    QuillGroup::build(
        new CleanField(),
    ),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="textFormatting"
    placeholder="Try text formatting…"
  />
</ClientOnly>
