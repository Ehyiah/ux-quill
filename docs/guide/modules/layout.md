# Layout Module configuration

**Auto-imported: YES** (if `LayoutField` is present in `quill_options`)

The Layout module allows users to organize content into multi-column sections. It supports inserting empty layouts or wrapping existing content into columns.

## Features

- **Multi-column presets**: 50/50, 30/70, 70/30, 3 columns
- **Wrap selection**: select existing content and convert it to columns (round-robin distribution)
- **Keyboard navigation**: Tab / Shift+Tab to move between columns, arrow keys at column edges
- **Content sync**: changes inside columns are automatically synchronized with the underlying form field

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `presets` | `array` | see below | List of available column presets |
| `allow_wrap` | `bool` | `true` | Enable wrapping existing content into columns |

### Default presets

| Label | Columns | Ratios |
|-------|---------|--------|
| `50/50` | 2 | `1fr`, `1fr` |
| `30/70` | 2 | `1fr`, `2fr` |
| `70/30` | 2 | `2fr`, `1fr` |
| `3 colonnes` | 3 | `1fr`, `1fr`, `1fr` |

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
| ArrowUp (at column start) | Move to end of previous column |
| ArrowDown (at column end) | Move to start of next column |
| Enter | New paragraph inside column |
| Shift+Enter | Line break (`<br>`) inside column |

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="layout"
    placeholder="Try inserting a multi-column layout…"
  />
</ClientOnly>
