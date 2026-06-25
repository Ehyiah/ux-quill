# Header Fields

Header fields for section titles.

| Field | QuillJS name | Description |
| --- | --- | --- |
| `HeaderField` | `header` | Single header level (configured via constant) |
| `HeaderGroupField` | `header` | Multiple header levels dropdown |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField;

'quill_options' => [
    QuillGroup::build(
        new HeaderField(HeaderField::HEADER_OPTION_1),
        new HeaderField(HeaderField::HEADER_OPTION_2),
    ),
    // Or use HeaderGroupField for a dropdown of all levels
    QuillGroup::build(
        new HeaderGroupField(),
    ),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="headers"
    placeholder="Try heading levels…"
  />
</ClientOnly>
