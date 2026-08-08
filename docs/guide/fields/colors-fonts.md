# Colors, Fonts & Size

Fields for text color, background color, font family, font size, and superscript/subscript.

| Field | QuillJS name | Description |
| --- | --- | --- |
| `ColorField` | `color` | Text color picker |
| `BackgroundColorField` | `background` | Text background color picker |
| `FontField` | `font` | Font family dropdown |
| `SizeField` | `size` | Font size dropdown |
| `ScriptField` | `script` | Superscript / subscript |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\BackgroundColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\FontField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\SizeField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ScriptField;

'quill_options' => [
    QuillGroup::build(
        new ColorField(),
        new BackgroundColorField(),
    ),
    QuillGroup::build(
        new FontField(),
        new SizeField(),
    ),
    QuillGroup::build(
        new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUB),
        new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUPER),
    ),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="colorsFonts"
    placeholder="Try colors, fonts and sizes…"
  />
</ClientOnly>
