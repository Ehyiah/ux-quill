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

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="map"
    placeholder="Click the map button to insert a map…"
  />
</ClientOnly>
