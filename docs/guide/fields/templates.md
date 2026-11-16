# TemplatesField

**Auto-imported module:** `TemplatesModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/templates) for details.

The `TemplatesField` adds a **Templates** button to the toolbar. Clicking it opens a dropdown listing predefined HTML templates. Selecting a template inserts its content at the cursor position.

**QuillJS name:** `template`

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TemplatesField;
use Ehyiah\QuillJsBundle\DTO\Modules\TemplatesModule;

'quill_options' => [
    QuillGroup::build(new TemplatesField()),
],
'modules' => [
    new TemplatesModule(), // auto-imported, but can be added manually to customize templates
],
```

To provide your own templates, pass them via the `options` argument of `TemplatesModule` — see the [module documentation](/guide/modules/templates) for the list of available templates and options.

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="templates"
    placeholder="Try inserting a template…"
  />
</ClientOnly>
