# Grid Borders Module

**Auto-imported: NO** (Must be added manually to the `modules` option)

The `GridBordersModule` adds a visible outline around every primary block in the editor, helping users visualize the grid/layout structure of their content.

When activated, each block-level element (paragraphs, headings, images, dividers, etc.) gets a subtle dashed border, making it easy to see where one block ends and another begins. This is especially useful for layout and structure debugging during content editing.

This module works **perfectly alongside the `NodeMoverModule`** — the NodeMover overlay appears above the grid borders when a block is selected, giving both a structural overview and precise block manipulation.

## Features

- **Visual Grid**: Displays a subtle outline around every block element in the editor.
- **Toggle Button**: Adds a toggle button in the Quill toolbar to show/hide the grid.
- **Configurable Default**: Can start active or hidden on page load.
- **Customizable Style**: Border color, width, and style are fully configurable.
- **Live Dynamic**: New blocks added to the editor automatically get the grid outline.
- **No Layout Shift**: Uses CSS `outline` (not `border`), so the content layout is never affected.

## Configuration

```php
use Ehyiah\QuillJsBundle\DTO\Modules\GridBordersModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new GridBordersModule([
            'active' => true,             // Start with grid visible
            'borderColor' => '#e0e0e0',   // Custom border color
            'borderStyle' => 'dashed',    // 'dashed', 'solid', or 'dotted'
            'borderWidth' => 1,           // Border thickness in pixels
            'toggleButton' => true,       // Show toggle in toolbar
        ]),
    ],
]);
```

Minimal usage (starts hidden, toggle button available):

```php
new GridBordersModule(),
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `bool` | `false` | If `true`, the grid is visible immediately when the editor loads. |
| `borderColor` | `string`\|`null` | `'#d0d0d0'` | Color of the block outline. Set to `null` to use the JS default. |
| `borderWidth` | `int` | `1` | Thickness of the outline in pixels. |
| `borderStyle` | `string` | `'dashed'` | Outline style: `'dashed'`, `'solid'`, or `'dotted'`. |
| `toggleButton` | `bool` | `true` | If `true`, adds a grid icon button to the toolbar to toggle visibility. |

## User Experience

1. **Activation**: Click the grid icon (⋮⋮) in the toolbar to toggle the grid on or off.
2. **Visual Feedback**: Every block gets a dashed outline. The button highlights when active.
3. **Editor Responsiveness**: The grid updates automatically as you add, remove, or reorder blocks.
4. **Complementary with NodeMover**: Use both modules together — the grid shows the structure while NodeMover lets you manipulate blocks.

## Try it live

<script setup>
const gridContent = '<h1>Discover the Grid</h1><p>Click the grid icon in the toolbar to toggle borders on all blocks.</p><h2>A subtitle</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><img src="https://picsum.photos/seed/grid/800/400" alt="Example image"><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>'
</script>

<ClientOnly>
  <QuillPlayground
    enabled="headers,gridBorders"
    placeholder="Click the grid icon in the toolbar to toggle borders…"
    :content="gridContent"
  />
</ClientOnly>
