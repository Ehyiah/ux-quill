# MapModule

**Auto-imported: YES** (if [`MapField`](/guide/fields/map) is present in `quill_options`)

The Map module enables interactive map embedding in the editor. It supports OpenStreetMap (via Leaflet) and Google Maps as map providers. Users can insert a map with a draggable marker to select a geographic location.

This module is automatically loaded if the `MapField` is present in your `quill_options`. If not, you must add it manually to the `modules` option.

## Providers

### OpenStreetMap (Leaflet)

The default provider. No API key required. Uses [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles.

### Google Maps

Requires a valid Google Maps JavaScript API key. See [Google Maps documentation](https://developers.google.com/maps/documentation/javascript/get-api-key) for obtaining an API key.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `provider` | `string` | `'osm'` | Map provider: `'osm'` for OpenStreetMap or `'google'` for Google Maps |
| `center` | `array` | `[48.8566, 2.3522]` | Default map center as `[latitude, longitude]` (default: Paris) |
| `zoom` | `int` | `13` | Default zoom level (1-19) |
| `googleApiKey` | `string\|null` | `null` | Google Maps API key (required when provider is `'google'`) |
| `tileUrl` | `string\|null` | `null` | Custom tile URL template for OSM (e.g., `'https://{s}.tile.custom.com/{z}/{x}/{y}.png'`) |
| `height` | `string` | `'300px'` | Map container height (any CSS unit) |
| `scrollWheelZoom` | `bool` | `true` | Allow zooming with mouse scroll wheel |
| `draggable` | `bool` | `true` | Allow dragging the marker to reposition |
| `marker` | `array\|null` | `null` | Custom marker options (see below) |
| `debug` | `bool` | `false` | Log the received options, inserted value and marker in the browser console (editor only) |

### Custom marker

The `marker` option lets you customize the map marker for both providers (Leaflet/OSM and Google Maps). It is applied everywhere: the editor, the location picker modal and the final rendered maps.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `iconUrl` | `string\|null` | `null` | Custom marker image URL (Leaflet `iconUrl` / Google `url`) |
| `iconRetinaUrl` | `string\|null` | `null` | Retina version of the icon (Leaflet only) |
| `shadowUrl` | `string\|null` | `null` | Shadow image URL (Leaflet only) |
| `iconSize` | `array\|null` | `[25, 41]` | Icon size as `[width, height]` |
| `iconAnchor` | `array\|null` | `[12, 41]` | Anchor point as `[x, y]` |
| `popupAnchor` | `array\|null` | `[1, -34]` | Popup offset (Leaflet only) |
| `shadowSize` | `array\|null` | `[41, 41]` | Shadow size (Leaflet only) |
| `label` | `string\|null` | `null` | Label on the marker. Without `iconUrl`, renders a colored round pin with the label (Leaflet) |

> If `label` is provided without `iconUrl`, a round pin is rendered (Leaflet). On Google Maps, a custom `iconUrl` requires a `scaledSize` — if omitted, `[25, 41]` is used automatically.

> **Note:** the `marker` option only applies to maps **inserted after** it is configured. The marker options are stored on the embed at insertion time (the `data-marker` attribute on the `.ql-map` element). Maps already present in the editor or in saved content keep their current (default) marker. To apply a custom marker to an existing map, delete it and re-insert it.

```php
new MapModule(options: [
    'marker' => [
        'iconUrl' => 'https://example.com/my-pin.png',
        'iconSize' => [40, 40],
        'iconAnchor' => [20, 40],
        'label' => 'A',
    ],
]),
```

To debug the marker (or any map option) in the editor, enable `debug` — the options received from PHP, the inserted value and the marker passed to the renderer are printed to the browser console:

```php
new MapModule(options: [
    'debug' => true,
    'marker' => [
        'iconUrl' => 'https://example.com/my-pin.png',
    ],
]),
```

## Usage Example

### Default (OpenStreetMap)

```php
use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;

'modules' => [
    new MapModule(),
],
```

### OpenStreetMap with Custom Settings

```php
new MapModule(options: [
    'center' => [51.5074, -0.1278],  // London
    'zoom' => 10,
    'height' => '400px',
]),
```

### Google Maps

```php
new MapModule(options: [
    'provider' => 'google',
    'googleApiKey' => 'YOUR_API_KEY',
    'center' => [40.7128, -74.0060],  // New York
    'zoom' => 12,
]),
```

### Custom Tile Provider

```php
new MapModule(options: [
    'tileUrl' => 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
]),
```

## Behavior

### Inserting a map

1. Click the map toolbar button → a **location picker modal** opens
2. **Search** for a location by typing an address or place name (geocoding via Nominatim)
3. Or **click on the preview map** to place the marker at the desired position
4. Click **"Insert Map"** to insert the map at the chosen location

### Editing a map

- **Click on the map** to activate it (enables panning and zooming)
- **Click outside the map** to deactivate it (prevents accidental interaction while editing text)
- **Drag the marker** to adjust the position — the coordinates are saved automatically

### Map selection toolbar

Selecting an inserted map shows a floating toolbar (provided by the `mapSelection` module, enabled by default when a `MapField` is present):

- **¶+ / +¶** — insert an empty paragraph before or after the map
- **Size (25% / 50% / 75% / 100% + custom)** — set the map width (like the image/video module)
- **Align left / center / right** — aligns the map within the content, like the image module
- **Edit location** — re-opens the location picker pre-filled with the map's current position
- **Delete** — removes the map from the editor

> **Note:** alignment has a visible effect only when the map width is below 100%.

## CSS Customization

The map container uses the class `.ql-map`. You can customize it with CSS:

```css
.ql-map {
    border-radius: 8px;
    border: 2px solid #e0e0e0;
    margin: 16px 0;
}

.ql-map:hover {
    border-color: #007bff;
}
```

## Displaying saved maps

To render saved maps on a page (outside the editor), include the `quill_content_scripts()` function in your template:

```twig
<twig:QuillContent :value="content" />

{{ quill_content_styles() }}
{{ quill_content_scripts() }}
```

The `quill_content_scripts()` function emits a `<script>` tag that automatically initializes all `.ql-map` elements on the page.

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="map"
    placeholder="Click the map button to insert a map…"
  />
</ClientOnly>
