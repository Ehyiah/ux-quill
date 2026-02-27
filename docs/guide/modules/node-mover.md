# NodeMover Module

The `NodeMoverModule` is a powerful tool designed to make content reordering intuitive and fluid. Unlike standard modules that only handle specific elements, this module provides a universal interface to move any block-level element (paragraphs, headings, images, lists, etc.) within the editor.

## Features

- **Universal Movement**: Works on all types of content blocks.
- **Multi-Selection Support**: Select multiple paragraphs and move them as a single cohesive unit.
- **Gutter Interface**: A discreet toolbar appears in the editor gutter when content is selected.
- **Precise Controls**: Move blocks up or down one by one using dedicated buttons.
- **Smart Drag & Drop**: Drag your selection to a new location with a live blue drop indicator showing exactly where it will land.
- **No-Merge Logic**: Ensures that dropping a block between others never accidentally merges or breaks your HTML structure.
- **Quick Delete**: A trash icon to instantly remove the selected blocks.

## Installation

This module is **optional** and must be explicitly enabled in your `FormType`.

```php
use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new NodeMoverModule([
            'borderColor' => '#007bff' // Optional: customize the selection frame color
        ]),
    ],
]);
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `borderColor` | `string` | `#007bff` | The color of the selection outline and the drop indicator line. |

## User Experience

1. **Selection**: Click inside a block or highlight multiple blocks with your mouse. A blue frame will appear around the selection.
2. **Toolbar**: A small vertical toolbar will appear to the left of the selection.
3. **Moving**: 
    - Click **Up/Down** arrows for precise block-by-block movement.
    - Grab the **Move** icon (six dots) to drag the selection. A blue horizontal line will indicate the insertion point.
4. **Auto-Hide**: The mover interface automatically disappears when you start typing to ensure a distraction-free writing experience.

::: tip PRO TIP
When dragging, the blue line will "snap" between paragraphs. If you drag back over the original selection, the line will disappear to indicate that no move will occur if dropped there.
:::
