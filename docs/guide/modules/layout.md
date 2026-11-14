# Layout Module configuration

**Auto-imported: YES** (if `LayoutField` is present in `quill_options`)

The Layout module allows users to organize content into multi-column sections. It supports inserting empty layouts or wrapping existing content into columns.

## Features

- **Multi-column presets**: 50/50, 30/70, 70/30, 3 columns
- **Wrap selection**: select existing content and convert it to columns (round-robin distribution)
- **Contextual chrome**: hover or focus an existing layout to switch its preset, add/remove columns, duplicate it or unwrap it
- **Column feedback**: the active column is outlined, hovered columns are tinted and empty columns display a placeholder
- **Keyboard navigation**: Tab / Shift+Tab to move between columns
- **Content sync**: changes inside columns are automatically synchronized with the underlying form field

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `presets` | `array` | see below | List of available column presets |
| `allow_wrap` | `bool` | `true` | Enable wrapping existing content into columns |
| `ui` | `bool` | `true` | Show the contextual layout chrome (preset switch, add/remove column, duplicate, remove) |
| `show_badge` | `bool` | `true` | Display the column count and ratios badge inside the chrome |

### Default presets

| Label | Columns | Ratios |
|-------|---------|--------|
| `50/50` | 2 | `1fr`, `1fr` |
| `30/70` | 2 | `1fr`, `2fr` |
| `70/30` | 2 | `2fr`, `1fr` |
| `3 columns` | 3 | `1fr`, `1fr`, `1fr` |

## Usage

### Basic usage with default presets

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LayoutField;

$builder->add('content', QuillType::class, [
    'quill_options' => [
        QuillGroup::build(
            new LayoutField(),
            new BoldField(),
            // ...
        ),
    ],
]);
```

### Custom presets

```php
use Ehyiah\QuillJsBundle\DTO\Modules\LayoutModule;

$builder->add('content', QuillType::class, [
    // ...
    'modules' => [
        new LayoutModule(options: [
            'presets' => [
                ['cols' => 2, 'ratios' => ['1fr', '1fr'], 'label' => '50/50'],
                ['cols' => 4, 'ratios' => ['1fr', '1fr', '1fr', '1fr'], 'label' => '4 columns'],
            ],
            'allow_wrap' => false,
            'ui' => false,          // hide the contextual chrome
            'show_badge' => false,  // hide the "2 columns · 50/50" badge
        ]),
    ],
]);
```

## Rendering layouts on the frontend

See [dedicaded section to custom rendering](/guide/usage.html#explaining-the-css-layers)

## Behavior

### Insert mode
Clicking the layout button in the toolbar opens a preset picker. Selecting one inserts an empty multi-column section at the cursor position.

### Wrap mode
If text is selected when clicking the layout button, the selected content is distributed across the columns in round-robin fashion. Block elements (`<p>`, `<h1>`, `<ul>`, etc.) are distributed one by one.

### Keyboard navigation
| Key | Action |
|-----|--------|
| Tab | Move to next column |
| Shift+Tab | Move to previous column |
| Enter | New paragraph inside column |
| Shift+Enter | Line break (`<br>`) inside column |
| Escape | Hide the layout chrome / close its menu |

## Editing an existing layout

Once a layout is inserted, a small chrome appears above it when you hover it or move the caret inside one of its columns:

| Action | Behavior |
|--------|----------|
| **Choose a layout** | Switches the ratios, or changes the column count. Shrinking merges the extra columns into the last one, so no content is lost. |
| **Add column** | Inserts an empty column after the active one and adds a matching `1fr` ratio at the same position. |
| **Remove column** | Removes the active column. Disabled below 2 columns. When the column contains text or media, a confirmation is shown first; after confirmation its content is merged into the neighbouring column. |
| **Duplicate layout** | Inserts a copy of the layout right after it. |
| **Remove layout** | Unwraps the layout: the column content is kept and moved back to the editor root. |

The chrome is editor-only. Its markup lives outside `.ql-editor` and the editor-only classes (`ql-layout-col--active`, `ql-layout-col--empty`) are stripped when the content is serialized, so the saved HTML is identical to a layout that was never edited.

Set `'ui' => false` in the module options to disable the chrome while keeping column feedback and toolbar insertion.

> **Undo:** structural changes (changing the column count, adding/removing a column, duplicating or unwrapping a layout) rebuild the editor content so Quill can re-sync its model. They are therefore **not** reversible with `Ctrl+Z` yet. Ratio-only preset switches keep the document untouched.

### Events

Every layout edit refreshes the underlying form field immediately, even without a keystroke.

| Event | Where | Payload | When |
|-------|-------|---------|------|
| `quill:layout:change` | DOM event, bubbles from the controller element | `{ html: string }` | After any edit made through the layout chrome |
| `ux-quill:layout-change` | Quill emitter (`quill.on(...)`) | `{ node: HTMLElement \| null, value: LayoutValue \| null }` | Same moment, for integrations that hold the Quill instance |

```js
// From the `connect` event of the Stimulus controller
element.addEventListener('quill:connect', (event) => {
    event.detail.on('ux-quill:layout-change', ({ value }) => {
        console.log(value?.cols, value?.ratios);
    });
});
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="layout"
    placeholder="Try inserting a multi-column layout…"
  />
</ClientOnly>
