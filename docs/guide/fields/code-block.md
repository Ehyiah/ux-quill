# CodeBlockField

**Auto-imported module:** `SyntaxModule` (automatically loaded when this field is used)

The `CodeBlockField` adds a code block button to the toolbar. Clicking it inserts a code block with syntax highlighting powered by [highlight.js](https://highlightjs.org/).

**QuillJS name:** `code-block`

Powered by the [Syntax module](https://quilljs.com/docs/modules/syntax/).

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;

'quill_options' => [
    QuillGroup::build(new CodeBlockField()),
],
'modules' => [
    new SyntaxModule(),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="codeBlock"
    placeholder="Try inserting a code block…"
  />
</ClientOnly>
