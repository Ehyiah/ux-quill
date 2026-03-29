# Quill Options

This section explains how to configure the toolbar available **Fields** and the available fields using `quill_options`.

## Customize Toolbar

You can customize the toolbar by creating one or many Groups. If you create many groups, they will be separated by a space in the toolbar.

### Examples

**Headers side by side:**
```php
QuillGroup::build(
    new HeaderField(HeaderField::HEADER_OPTION_1),
    new HeaderField(HeaderField::HEADER_OPTION_2),
)
```

**Headers + Bold/Italic separated:**
```php
QuillGroup::build(
    new HeaderField(HeaderField::HEADER_OPTION_1),
    new HeaderField(HeaderField::HEADER_OPTION_2),
)
QuillGroup::build(
    new BoldField(),
    new ItalicField(),
)
```

## Available Fields

Below is the list of available fields from QuillJS (https://v2.quilljs.com/docs/formats)

| Field | Description | Available options (class constants) | Default | QuillJS name |
| :--- | :--- | :--- | :---: | :---: |
| **AlignField** | Text alignment | `ALIGN_FIELD_OPTION_LEFT`, `ALIGN_FIELD_OPTION_CENTER`, `ALIGN_FIELD_OPTION_RIGHT`, `ALIGN_FIELD_OPTION_JUSTIFY` | all | `align` |
| **BackgroundColorField** | Text background color | array of colors (strings) | all | `background` |
| **BlockQuoteField** | Blockquote | - | - | `blockquote` |
| **BoldField** | Bold text | - | - | `bold` |
| **CleanField** | Remove formatting | - | - | `clean` |
| **CodeBlockField** | Code block | - | - | `code-block` |
| **CodeField** | Inline code | - | - | `code` |
| **ColorField** | Text color | array of colors (strings) | all | `color` |
| **DirectionField** | Text direction | `DIRECTION_FIELD_OPTION_RTL` | `RTL` | `direction` |
| **FontField** | Font family | `FONT_OPTION_SANS_SERIF`, `FONT_OPTION_SERIF`, `FONT_OPTION_MONOSPACE` | all | `font` |
| **FormulaField** | Formula (requires KaTeX) | - | - | `formula` |
| **HeaderField** | Single header level | `HEADER_OPTION_1`, `HEADER_OPTION_2` | `1` | `header` |
| **HeaderGroupField** | Multiple header levels | `HEADER_OPTION_1` to `HEADER_OPTION_6`, `HEADER_OPTION_NORMAL` | all | `header` |
| **ImageField** | Insert image | - | - | `image` |
| **IndentField** | Text indentation | `INDENT_FIELD_OPTION_PLUS`, `INDENT_FIELD_OPTION_MINUS` | `+1` | `indent` |
| **ItalicField** | Italic text | - | - | `italic` |
| **LinkField** | Insert link | - | - | `link` |
| **ListField** | Lists | `LIST_FIELD_OPTION_ORDERED`, `LIST_FIELD_OPTION_BULLET`, `LIST_FIELD_OPTION_CHECK` | `ordered` | `list` |
| **ScriptField** | Sub/Superscript | `SCRIPT_FIELD_OPTION_SUB`, `SCRIPT_FIELD_OPTION_SUPER` | `sub` | `script` |
| **SizeField** | Text size | `SIZE_FIELD_OPTION_SMALL`, `SIZE_FIELD_OPTION_NORMAL`, `SIZE_FIELD_OPTION_LARGE`, `SIZE_FIELD_OPTION_HUGE` | all | `size` |
| **StrikeField** | Strikethrough | - | - | `strike` |
| **UnderlineField** | Underline text | - | - | `underline` |
| **VideoField** | Insert video | - | - | `video` |

### Community & Custom Fields

These fields are provided by the bundle or integrated community modules. Most of them **automatically load** a corresponding module.

| Field | Description | Auto-imported module | QuillJS name |
| :--- | :--- | :--- | :---: |
| **DividerField** | Horizontal separator | `DividerModule` | `divider` |
| **EmojiField** | Emoji picker | `EmojiModule` | `emoji` |
| **PageBreakField** | Page break (for print) | `PageBreakModule` | `pageBreak` |
| **TableField** | Advanced table support | `TableModule` | `table-better` |

> [!TIP]
> If you need to add a field that is not provided by this bundle, you can create your own. See [Custom Fields](/guide/advanced/custom-fields) for more details.

## Example

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        ->add('myField', QuillType::class, [
            'quill_options' => [
                QuillGroup::build(
                    new BoldField(),
                    new ItalicField(),
                ),
                QuillGroup::build(
                    new HeaderField(HeaderField::HEADER_OPTION_1),
                    new HeaderField(HeaderField::HEADER_OPTION_2),
                ),
                // Add all built-in available fields at once (includes Table, Emoji, etc.)
                QuillGroup::buildWithAllFields()
            ]
        ])
    ;
}
```
