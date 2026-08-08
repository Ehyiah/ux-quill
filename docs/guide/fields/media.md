# Media & Formula Fields

Fields for inserting videos and formulas.

| Field | QuillJS name | Description |
| --- | --- | --- |
| `VideoField` | `video` | Insert a video (by URL) |
| `FormulaField` | `formula` | Insert a mathematical formula (requires KaTeX) |

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;

'quill_options' => [
    QuillGroup::build(
        new VideoField(),
    ),
    QuillGroup::build(
        new FormulaField(),
    ),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="media"
    placeholder="Try inserting a video or formula…"
  />
</ClientOnly>
