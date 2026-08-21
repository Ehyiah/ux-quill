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

- **Drag the map background** to pan the view directly
- **Drag the marker** to adjust the position — the coordinates are saved automatically
- The map does not capture keyboard focus, so typing in the editor is unaffected

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

To render saved maps on a page (outside the editor), **`quill_content_scripts()` is required** — together with `quill_content_styles()` — in your template:

```twig
<twig:QuillContent :value="content" />

{{ quill_content_styles() }}
{{ quill_content_scripts() }} {# ← required: initializes the maps #}
```

`quill_content_scripts()` emits a Stimulus controller element (`data-controller="ehyiah--ux-quill--quill-maps"`) that initializes every `.ql-map` element on the page.

> **The display page must render the importmap** (`importmap('app')`, usually in `base.html.twig`) so the controller can be loaded. After updating the bundle, re-run `bin/console importmap:install`.
>
> **With Webpack Encore**, the `quill-maps` controller is registered via `@symfony/stimulus-bridge` from `assets/controllers.json`. After updating the bundle, run `bin/console ux:controllers:dump` (or add the `quill-maps` entry manually), then rebuild your assets (`yarn watch` / `yarn build`).
>
> See [Usage → Loading the required JavaScript](/guide/usage#loading-the-required-javascript-maps) for when `quill_content_scripts()` is needed.

> **Without `quill_content_scripts()`, maps are not initialized:** the saved content contains the Leaflet markup rendered in the editor, and without the script (and its Leaflet CSS) the map tiles display as an unstyled grid of grey squares. Always include both functions on the display page.

> By default the saved content stores the editor's rendered HTML (`use_semantic_html` is `false`). If you prefer a lighter, clean saved markup (the `.ql-map` element and its data attributes only, no tiles), enable `use_semantic_html` in `quill_extra_options` — `quill_content_scripts()` is still required to render the map.

> **Troubleshooting — 404 on `/assets/@ehyiah/ux-quill/dist/modules/map-utils.js`:** the display page is loading `map-init.js` as a plain module without the importmap, so its relative imports can't be resolved (AssetMapper only serves versioned files). Make sure the display page renders the importmap (`importmap('app')`, usually in `base.html.twig`) and that `bin/console importmap:install` has been re-run after updating the bundle.

### Map events

The `quill-maps` controller dispatches custom events on each `.ql-map` element during initialization (`bubbles: true`, so you can listen on `document`):

| Event | Detail | When |
| --- | --- | --- |
| `ux-quill:map:before-init` | `{ options }` | Before a map starts initializing |
| `ux-quill:map:initialized` | `{ options }` | After a map has been initialized successfully |
| `ux-quill:map:error` | `{ options, message }` | When a map fails to initialize (missing Google API key, failed library load) |
| `ux-quill:maps:completed` | — | On the controller element, after all maps on the page have been processed |

`options` is the full map value read from the `.ql-map` element: `provider` (`'osm'` or `'google'`), `lat`, `lng`, `zoom`, `googleApiKey`, `tileUrl`, `height`, `width`, `scrollWheelZoom`, `draggable`, `marker`. Example:

```js
document.addEventListener('ux-quill:map:initialized', (event) => {
    console.log(`Map initialized (${event.detail.options.provider})`, event.target);
    console.log('Marker:', event.detail.options.marker);
});

document.addEventListener('ux-quill:map:error', (event) => {
    console.error('Map failed:', event.detail.options.provider, event.detail.message);
});
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="map"
    placeholder="Click the map button to insert a map…"
  />
</ClientOnly>
