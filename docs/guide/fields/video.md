# VideoField

**Auto-imported module:** `VideoSelectionModule` (automatically loaded when this field is used)

The `VideoField` adds a video button to the toolbar and enhances QuillJS’s default video handling, which is limited to inserting a simple, non-configurable embed. 
This implementation introduces advanced customization options such as sizing, improved rendering control, as well as SEO and accessibility optimizations and many more providers.

Clicking it prompts for a video URL and inserts it into the editor as an embedded `<iframe>` wrapped in a `<figure>` with optional caption. The companion module adds a selection overlay, resize handles, alignment, and editing capabilities.

**QuillJS name:** `video`

## Companion module

`VideoSelectionModule` is automatically loaded. See the [full module documentation](/guide/modules/video-selection) for all available options.

## Supported providers

When you insert or paste a video URL, it is automatically transformed into the correct embed format. The following providers are supported:

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

To add custom providers, see the [VideoSelectionModule documentation](/guide/modules/video-selection#custom-providers).

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;

'quill_options' => [
    QuillGroup::build(new VideoField()),
],
'modules' => [
    new VideoSelectionModule(options: [
        'borderColor' => '#007bff',
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
