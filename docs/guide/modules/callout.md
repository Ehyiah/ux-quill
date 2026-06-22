# CalloutModule

**Auto-imported: YES** (if `CalloutField` is present in `quill_options`)

The Callout module allows users to insert styled alert/callout blocks (info, warning, danger, success) into their content.

This module is automatically loaded if the `CalloutField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

**Options:**

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `types` | `string[]` | `['info', 'warning', 'danger', 'success']` | Available callout types |
| `defaultType` | `string` | `'info'` | Default type when inserting |
| `labels` | `array<string, string>` | `['info' => 'Info', 'warning' => 'Warning', 'danger' => 'Danger', 'success' => 'Success']` | Display labels per type |
| `icons` | `array<string, string>` | SVG icons per type | Custom HTML for each type's icon |

**Behavior:**
Clicking the `callout` toolbar button opens a **type picker dropdown** where users can choose the callout type (Info, Warning, Danger, Success). Selecting a type inserts a styled callout block at the cursor position with an editable content area inside.

**Usage example:**

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CalloutField;

'quill_options' => [
    QuillGroup::build(new CalloutField()),
],
```

The module is **auto-imported** — no need to declare it manually when `CalloutField` is present.

**Adding the module manually** (if not using the field):

```php
'modules' => [
    new CalloutModule(),
],
```

**Customising options:**

```php
new CalloutModule(options: [
    'defaultType' => 'warning',
    'labels' => [
        'info' => 'Information',
        'warning' => 'Attention',
        'danger' => 'Erreur',
        'success' => 'Réussi',
    ],
]),
```
