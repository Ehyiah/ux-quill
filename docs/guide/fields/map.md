# MapField

**Auto-imported module:** `MapModule` (automatically loaded when this field is used) — see the [module documentation](/guide/modules/map) for details.

The `MapField` adds an interactive map button to the toolbar. Clicking it opens a **location picker modal** with a search bar (powered by [Nominatim](https://nominatim.openstreetmap.org/) geocoding) and a preview map. You can search for a place or click directly on the preview to position the marker, then confirm to insert the map into the editor.

**QuillJS name:** `map`

Powered by [Leaflet](https://leafletjs.com/) for OpenStreetMap and [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) for Google Maps.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\MapField;
use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;

'quill_options' => [
    QuillGroup::build(new MapField()),
],
'modules' => [
    new MapModule(), // auto-imported, but can be added manually to customize options
],
```

## Custom Provider Configuration

```php
use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;

'modules' => [
    new MapModule(options: [
        'provider' => 'osm',      // 'osm' or 'google'
        'center' => [48.8566, 2.3522],  // [lat, lng] — default: Paris
        'zoom' => 13,
        'height' => '400px',
        'scrollWheelZoom' => true,
        'draggable' => true,
    ]),
],
```

## Google Maps Provider

```php
new MapModule(options: [
    'provider' => 'google',
    'googleApiKey' => 'YOUR_GOOGLE_MAPS_API_KEY',
    'center' => [40.7128, -74.0060],  // New York
    'zoom' => 12,
]),
```

## Displaying saved maps

To render saved maps on a page (outside the editor), include the `quill_content_scripts()` function in your template:

```twig
twig:QuillContent :value="content" />

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
