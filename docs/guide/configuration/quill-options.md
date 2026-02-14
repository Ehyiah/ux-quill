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
| :---: | :---: | :---: | :---: | :---: |
| **BoldField** | mark text as bold | - | | bold |
| **ColorField** | Change color of the font | array of colors | | color |
| **BackGroundColorField** | change background color | array of colors | | background |
| **AlignField** | Choose text alignment | false (left), center, right, justify | all | align |
| **DirectionField** | Choose text direction | rtl | rtl | direction |
| **FontField** | Choose a font | ''(sans serif) ,serif, monospace | all | font |
| **HeaderGroupField** | List of header levels | 1, 2, 3, 4, 5, 6, false | all | header |
| **HeaderField** | H1 or H2 widget only | 1, 2 | 1 | header |
| **IndentField** | Add or Remove indent | +1, -1 | +1 | indent |
| **ListField** | Add a list | ordered, bullet, check | ordered | list |
| **ScriptField** | Subscript/Superscript | sub, super | sub | script |
| **SizeField** | Change text size | small, false, large, huge | all | size |
| **BlockQuoteField** | Quote a text | - | | blockquote |
| **CleanField** | Clean text styling | - | | clean |
| **CodeBlockField** | Add a code-block | - | | code-block |
| **CodeField** | Add some code | - | | code |
| **FormulaField** | add a formula (with Katex) | - | | formula |
| **ImageField** | Add an image | - | | image |
| **ItalicField** | mark text as italic | - | | italic |
| **LinkField** | Add a link | - | | link |
| **StrikeField** | mark text as striked | - | | strike |
| **UnderlineField** | mark text as underlined | - | | underline |
| **VideoField** | add an embed video | - | | video |

**Community Fields:**

| Field | Description |
| :---: | :---: |
| **EmojiField** | Add an emoji |
| **TableField** | Add a table field |


## Exemple
```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\HeaderField;

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
                // Or add all built-in available fields at once
                QuillGroup::buildWithAllFields()
            ]
        ])
    ;
}
```
