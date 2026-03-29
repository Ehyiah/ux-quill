# Modules

## Concept

**Modules** are functional extensions that enhance the capabilities of the Quill editor beyond simple text formatting.
They allow you to add interactive features, modify event handling, or integrate external tools.

- **Goal**: To provide business logic or complex functionality (e.g., resizing images, counting words, voice dictation, managing undo history).
- **How it works**: A module is loaded when the editor starts. It can interact with the Quill API, listen to events (keystrokes, selection changes),
- manipulate the editor's DOM, or add interface elements.

> **Note**: This bundle provides several **custom modules** that do not exist natively in QuillJS
> (like `ReadTimeModule`, `STTModule`, `FullScreenModule`, etc.), offering advanced features out of the box.

---

This bundle categorizes modules into two types:

1. **Field-dependent Modules**: These modules are tied to a specific Field DTO in `quill_options`. They are usually **auto-loaded** as soon as the corresponding field is added to the toolbar.
2. **Independent Modules**: These modules provide global functionality or behavior regardless of specific fields. They usually require manual registration in the `modules` array.

---

- You can add/customize quill modules in this option field.
- You can create your own modules classes, they need to implement the ``ModuleInterface`` and add the name and options properties.
- Some modules are automatically loaded when they are needed in fields by implementing the `QuillFieldModuleInterface`.

See [Custom Fields](/guide/advanced/custom-fields) for more details.

Example of how to use modules:

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\STTModule;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        ->add('content', QuillType::class, [
            'quill_options' => [
                //
            ],
            'modules' => [
                new SyntaxModules(),
                new TableModule(
                    'menus' => ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                    'toolbarTable' => 'true', // must be set to true to show the table toolbar options in TableModule
                    'language' => 'fr_FR',
                ),
            ],
            //
        ])
    ;
}
```
## Modules list
See module details on the left menu

### Field-dependent Modules
These modules are usually automatically imported when the corresponding field is present in `quill_options`.

| module | auto-imported | description | name | options type | default options |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **DividerModule** | YES | [see details](./divider.md) | divider | array | [] |
| **EmojiModule** | YES | Required if EmojiField is activated. | emoji-toolbar | string | `'true'` |
| **ImageSelectionModule** | YES | [see details](./image-selection.md) | imageSelection | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\ImageSelectionModule`` |
| **LinkAttributesModule** | YES | [see details](./link-attributes.md) | linkAttributes | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\LinkAttributesModule`` |
| **PageBreakModule** | YES | [see details](./pagebreak.md) | pageBreak | array | ['label' => 'Page Break'] |
| **ResizeModule** | YES | (Legacy) Basic image resizing functionality. | resize | array | [] |
| **SyntaxModule** | YES | Required for CodeBlockField. | syntax | string | `'true'` |
| **TableModule** | YES | [see details](https://github.com/attoae/quill-table-better) | table-better | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\TableModule`` |

### Independent Modules
These modules provide global behavior and must usually be added manually to the `modules` option.

| module | auto-imported | description | name | options type | default options |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **AutosaveModule** | NO | [see details](./autosave.md) | autosave | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\AutosaveModule`` |
| **CounterModule** | NO | [see details](./counter.md) | counter | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\CounterModule`` |
| **FullScreenModule** | NO | [see details](./fullscreen.md) | toggleFullscreen | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule`` |
| **HistoryModule** | NO | Responsible for handling undo and redo. | history | array | ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false'] |
| **HtmlEditModule** | NO | [see details](./html-edit.md) | htmlEditButton | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\HtmlEditModule`` |
| **MarkdownModule** | NO | [see details](./markdown.md) | markdown | array | [] |
| **MentionModule** | NO | [see details](./mention.md) | mention | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\MentionModule`` |
| **NodeMoverModule** | **ALWAYS** | [see details](./node-mover.md) | nodeMover | array | [] |
| **PasteSanitizerModule** | NO | [see details](./paste-sanitizer.md) | pasteSanitizer | array | ['plain_text' => true] |
| **ReadTimeModule** | NO | [see details](./read-time.md) | readingTime | array | ['wpm' => '200', 'label' => 'Reading time: ', 'suffix' => ' min read'] |
| **SmartLinksModule** | NO | [see details](./smart-links.md) | smartLinks | array | ['linkRegex' => '/https?:\/\/[^\s]+/'] |
| **STTModule** | NO | [see details](./stt.md) | speechToText | array | see ``Ehyiah\QuillJsBundle\DTO\Modules\STTModule`` |
