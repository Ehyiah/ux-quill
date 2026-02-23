# TemplatesModule

This module adds a **Templates** button to the toolbar. When clicked, it shows a dropdown listing predefined HTML templates. Selecting a template inserts its content at the current cursor position in the editor.

## Requirements

Both `TemplateField` in `quill_options` and `TemplatesModule` in `modules` are required:

```php
'quill_options' => [
    [new TemplateField()],
],
'modules' => [
    new TemplatesModule(),
],
```

`TemplateField` declares the button in the toolbar. `TemplatesModule` configures the templates and powers the dropdown. Because `TemplateField` auto-imports `TemplatesModule`, you only need to add `TemplatesModule` explicitly when you want to pass custom templates.

## Custom icon

Pass an SVG string to `TemplateField` to replace the default toolbar button icon:

```php
new TemplateField(icon: '<svg viewBox="0 0 18 18">...</svg>')
```

If both `TemplateField` and an explicit `TemplatesModule` are present, the icon from `TemplateField` takes precedence over any icon set in `TemplatesModule`. The icon can also be set directly on `TemplatesModule`:

```php
new TemplatesModule(icon: '<svg viewBox="0 0 18 18">...</svg>')
```

## Default templates

The following templates are provided out of the box and can be used as-is or as a reference:

| Constant | Label | Description |
| :--- | :--- | :--- |
| `TemplatesModule::TEMPLATE_SIGNATURE` | Signature | Closing block with name, title and email placeholders |
| `TemplatesModule::TEMPLATE_INTRODUCTION` | Introduction | Formal opening paragraph |
| `TemplatesModule::TEMPLATE_BULLET_LIST` | Bullet list | Unordered list with three placeholder items |
| `TemplatesModule::TEMPLATE_TABLE` | Table (3×3) | HTML table with a header row and two data rows |

You can mix default constants with your own templates:

```php
new TemplatesModule([
    TemplatesModule::TEMPLATE_SIGNATURE,
    TemplatesModule::TEMPLATE_INTRODUCTION,
    ['label' => 'My custom template', 'content' => '<p>Custom content here</p>'],
])
```

## Options

`TemplatesModule` accepts an array of templates. Each template is an associative array with two keys:

| Key | Type | Description |
| :---: | :---: | :--- |
| **label** | string | The name displayed in the dropdown |
| **content** | string | The HTML inserted into the editor at the cursor position |

## Basic usage

```php
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TemplateField;
use Ehyiah\QuillJsBundle\DTO\Modules\TemplatesModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'quill_options' => [
        [new BoldField(), new ItalicField(), new TemplateField()],
    ],
    'modules' => [
        new TemplatesModule([
            ['label' => 'Signature', 'content' => '<p>Cordialement,<br>John Doe</p>'],
            ['label' => 'Introduction', 'content' => '<p>Bonjour,</p><p>Je me permets de vous contacter au sujet de...</p>'],
            ['label' => 'Legal notice', 'content' => '<p><em>This document is confidential and intended solely for the addressee.</em></p>'],
        ]),
    ],
]);
```

### Use default templates without customization

Simply declare `TemplatesModule` without arguments:

```php
'quill_options' => [
    [new TemplateField()],
],
'modules' => [
    new TemplatesModule(),
],
```

## Behaviour

- The **Templates** button is visible in the toolbar once `TemplateField` is added to `quill_options`.
- Clicking the button opens a dropdown listing all configured templates.
- Clicking a template item **inserts** its HTML content at the current cursor position without replacing existing content.
- The dropdown closes automatically when clicking outside the editor or after a template is selected.
- The editor focus and cursor position are preserved during template insertion.
