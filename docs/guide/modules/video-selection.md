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
| `videoProviders` | `array` | `[]` | Custom video providers. See [Custom providers](#custom-providers) below. |
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

## Supported providers

When a video URL is pasted or inserted, it is automatically transformed into the correct embed format.

| Provider | Example URL | Embed URL |
| --- | --- | --- |
| **YouTube** | `https://youtube.com/watch?v=ID` | `https://www.youtube.com/embed/ID` |
| **Vimeo** | `https://vimeo.com/123456` | `https://player.vimeo.com/video/123456` |
| **Dailymotion** | `https://dailymotion.com/video/ID` | `https://www.dailymotion.com/embed/video/ID` |
| **Twitch** | `https://twitch.tv/CHANNEL` | `https://player.twitch.tv/?channel=CHANNEL&parent=HOST` |
| **Facebook** | `https://facebook.com/user/videos/123` | `https://www.facebook.com/plugins/video.php?href=URL` |
| **Spotify** | `https://open.spotify.com/track/ID` | `https://open.spotify.com/embed/track/ID` |
| **TikTok** | `https://tiktok.com/@user/video/123` | `https://www.tiktok.com/embed/v2/123` |

Any URL that doesn't match a known provider is inserted unchanged into the `<iframe>` — it will still work if the target supports embedding.

## Custom providers

You can add your own video providers by passing the `videoProviders` option. Each provider requires:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | A label for the provider (informational only). |
| `match` | `string` | A JavaScript regex pattern to match URLs. Escape backslashes for PHP. |
| `embed` | `string` | The embed URL template. Use `{1}`, `{2}`, etc. for captured groups from the regex. |

### Example: adding TikTok support

```php
use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;

'modules' => [
    new VideoSelectionModule([
        'videoProviders' => [
            [
                'name' => 'tiktok',
                'match' => 'tiktok\\.com/@[\\w-]+/video/(\\d+)',
                'embed' => 'https://www.tiktok.com/embed/v2/{1}',
            ],
        ],
    ]),
],
```

The regex `match` is evaluated as `new RegExp(match)` in JavaScript. Capture groups `(…)` are referenced as `{1}`, `{2}`, etc. in the `embed` template.

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="videoSelection,counter"
    placeholder="Try inserting and editing videos…"
  />
</ClientOnly>
