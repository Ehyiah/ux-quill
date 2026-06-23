# SpoilerModule

**Auto-imported: YES** (if [`SpoilerField`](/guide/fields/spoiler) is present in `quill_options`)

The Spoiler module allows users to insert collapsible `<details>` blocks into their content.

This module is automatically loaded if the `SpoilerField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

## Available options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `'Spoiler'` | Default spoiler summary text |
| `content` | `string` | `''` | Default spoiler body HTML |

## Usage example

```php
use Ehyiah\QuillJsBundle\DTO\Modules\SpoilerModule;

'modules' => [
    new SpoilerModule(options: [
        'title' => 'Click to reveal',
        'content' => '<p>Hidden content</p>',
    ]),
],
```

To enable the button in the toolbar:

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\SpoilerField;

'quill_options' => [
    QuillGroup::build(new SpoilerField()),
],
```

## Rendered output

When the content is saved and displayed via `<twig:QuillContent>`, spoiler blocks render as:

```html
<details>
    <summary>Spoiler title</summary>
    <p>Spoiler body content...</p>
</details>
```

Make sure to include `quill_content_styles()` in your layout to load the required CSS.
