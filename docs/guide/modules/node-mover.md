# NodeMover Module

**Auto-imported: YES** (Always loaded — see table below)

The `NodeMoverModule` adds a floating toolbar and drag handle to every block element in the editor, enabling users to **reorder**, **duplicate**, and **delete** blocks with a single click.

This module is **automatically enabled** in every Quill editor instance. To disable it, you must explicitly set `active => false` in your configuration.

## Features

- **Drag & Drop**: Grab the 6-dot handle to drag any block to a new position.
- **Move Up/Down**: Click the arrow buttons on the floating toolbar to reorder blocks.
- **Duplicate**: Create a copy of any block or selection.
- **Delete**: Remove blocks with a single click.
- **Multi-block Selection**: Select multiple blocks at once (hold Shift + click or drag-select) to move, duplicate, or delete them together.
- **Visual Overlay**: A highlighted border appears around the selected block(s).

## Configuration

```php
use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new NodeMoverModule([
            'active' => true,
            'borderColor' => '#007bff',
            'dropIndicatorColor' => '#ff0000',
            'duplicate' => true,
        ]),
    ],
]);
```

Minimal usage (auto-loaded with defaults):

```php
new NodeMoverModule(),
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `bool` | `true` | If `true`, the module is active immediately when the editor loads. |
| `borderColor` | `string`\|`null` | `null` | Color of the selection overlay border. `null` = no border without explicit config. |
| `dropIndicatorColor` | `string` | `'#ff0000'` | Color of the drop indicator line when dragging. |
| `duplicate` | `bool` | `true` | If `true`, adds a duplicate button to the floating toolbar. |

## User Experience

1. **Selection**: Click any block (paragraph, heading, image, etc.) to select it. A blue overlay border highlights the selection, and the floating toolbar appears to the left.
2. **Reorder**: Click the ▲ and ▼ buttons to move the selected block up or down.
3. **Drag**: Grab the 6-dot handle and drag the block to a new position. A red line indicates where the block will land.
4. **Duplicate**: Click the copy icon to duplicate the selected block.
5. **Delete**: Click the ✕ button to remove the selected block.

## Try it live

<script setup>
const nodeMoverContent = '<h1>Move Me</h1><p>Hover over any block to see the move toolbar on the left. Use the arrows to reorder, grab the 6-dot handle to drag, or click the copy and delete buttons.</p><h2>Second Block</h2><p>Try moving this heading above the first one using the up arrow in the toolbar.</p><img src="https://picsum.photos/seed/move/800/400" alt="Sample image"><p>You can also select multiple blocks by dragging across them, then move or delete them all at once.</p>'
</script>

<ClientOnly>
  <QuillPlayground
    enabled="headers,nodeMover"
    placeholder="Click any block to see the move toolbar…"
    :content="nodeMoverContent"
  />
</ClientOnly>
