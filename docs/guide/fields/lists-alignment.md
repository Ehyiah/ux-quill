# Lists, Alignment & Indentation

Fields for lists, text alignment, indentation, and text direction.

| Field | QuillJS name | Description |
| --- | --- | --- |
| `ListField` | `list` | Ordered, bullet, or check list |
| `IndentField` | `indent` | Increase / decrease indentation |
| `AlignField` | `align` | Text alignment (left, center, right, justify) |
| `DirectionField` | `direction` | Right-to-left text direction |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ListField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\IndentField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\AlignField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\DirectionField;

'quill_options' => [
    QuillGroup::build(
        new ListField(ListField::LIST_FIELD_OPTION_ORDERED),
        new ListField(ListField::LIST_FIELD_OPTION_BULLET),
        new ListField(ListField::LIST_FIELD_OPTION_CHECK),
    ),
    QuillGroup::build(
        new IndentField(IndentField::INDENT_FIELD_OPTION_PLUS),
        new IndentField(IndentField::INDENT_FIELD_OPTION_MINUS),
    ),
    QuillGroup::build(
        new AlignField(),
    ),
    QuillGroup::build(
        new DirectionField(),
    ),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="listsAlignment"
    placeholder="Try lists and alignment…"
  />
</ClientOnly>
