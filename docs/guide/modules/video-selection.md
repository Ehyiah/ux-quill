# VideoSelectionModule

**Auto-imported: YES** (if `VideoField` is present in `quill_options`)

The `VideoSelectionModule` provides an interactive way to manage embedded videos within the editor. It adds a selection overlay with resize handles and a dedicated toolbar for quick actions.

This module is **automatically enabled** when the `VideoField` is used. If you don't use the `VideoField` but still want the module, you must add it manually to the `modules` option.

## Features

- **Resize Handles**: Drag corners to resize both width and height of the video.
- **Quick Alignment**: Buttons for left (wrapped), left (block), center, and right alignments.
- **Preset Sizes**: Quickly set width to 25%, 50%, 75%, or 100%.
- **Custom Size**: Input exact width in pixels or percentage.
- **Play Button**: Opens the video URL in a new tab.
- **Metadata Editing**:
    - **Edit URL**: Change the embedded video source URL.
    - **Edit Title**: Set or update the `title` attribute for accessibility.
    - **Edit Caption**: Add or edit the figure caption.
    - **Toggle Loading**: Switch between `lazy` and `eager` loading.
- **Paragraph Insertion**: Buttons to quickly insert an empty paragraph before or after the video.
- **Delete**: Quickly remove the video and its figure from the editor.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `borderColor` | `string` | `'#007bff'` | Color of the selection border and handles. |
| `borderWidth` | `string` | `'4px'` | Width of the selection border. |
| `playTitle` | `string` | `'Play video'` | Tooltip for the play button. |
| `editUrlTitle` | `string` | `'Edit video URL'` | Tooltip for the URL editing button. |
| `editTitleTitle` | `string` | `'Edit title'` | Tooltip for the title editing button. |
| `editCaptionTitle` | `string` | `'Edit caption'` | Tooltip for the caption editing button. |
| `buttonBeforeLabel` | `string` | `'¶+'` | Label for the "insert paragraph before" button. |
| `buttonAfterLabel` | `string` | `'+¶'` | Label for the "insert paragraph after" button. |
| `buttonBeforeTitle` | `string` | `'Insert a paragraph before'` | Tooltip for the "before" button. |
| `buttonAfterTitle` | `string` | `'Insert a paragraph after'` | Tooltip for the "after" button. |
| `deleteTitle` | `string` | `'Delete video'` | Tooltip for the delete button. |
| `alignLabels` | `array` | See below | Custom labels for alignment tooltips. |
| `sectionLabels` | `array` | See below | Small labels displayed above toolbar sections. To disable, pass an empty array `[]`. |

### alignLabels default values

```php
'alignLabels' => [
    'left' => 'Left (wrapped)',
    'leftBlock' => 'Left (no wrap)',
    'center' => 'Align center',
    'right' => 'Right (wrapped)',
]
```

### sectionLabels default values

```php
'sectionLabels' => [
    'size' => 'Size',
    'align' => 'Align',
    'video' => 'Video',
    'insert' => 'Insert',
]
```

## Usage example

Although it's usually auto-imported, you can manually configure it with custom options:

```php
use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;

// ...

'modules' => [
    new VideoSelectionModule([
        'borderColor' => '#ff0000',
        'buttonBeforeLabel' => 'Insert Before',
        'alignLabels' => [
            'center' => 'Centrer la vidéo',
        ],
    ]),
],
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="videoSelection,counter"
    placeholder="Try inserting and editing videos…"
  />
</ClientOnly>
