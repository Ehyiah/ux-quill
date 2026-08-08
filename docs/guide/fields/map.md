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
        'marker' => [              // custom marker (see module docs for all options)
            'iconUrl' => 'https://example.com/my-pin.png',
            'iconSize' => [40, 40],
        ],
    ]),
],
```

See the [module documentation](/guide/modules/map#custom-marker) for the full list of marker options (`iconRetinaUrl`, `shadowUrl`, `iconAnchor`, `popupAnchor`, `shadowSize`, `label`). Marker options apply to newly inserted maps — existing maps keep their default marker.

## Google Maps Provider

```php
new MapModule(options: [
    'provider' => 'google',
    'googleApiKey' => 'YOUR_GOOGLE_MAPS_API_KEY',
    'center' => [40.7128, -74.0060],  // New York
    'zoom' => 12,
]),
```

## Map selection toolbar

Selecting an inserted map in the editor shows a floating toolbar (provided by the `mapSelection` module, enabled by default with `MapField`):

- **¶+ / +¶** — insert an empty paragraph before or after the map
- **Size (25% / 50% / 75% / 100% + custom)** — set the map width
- **Align left / center / right** — aligns the map within the content
- **Edit location** — re-opens the location picker pre-filled with the map's current position
- **Delete** — removes the map from the editor

> **Note:** alignment has a visible effect only when the map width is below 100%.

See the [module documentation](/guide/modules/map#map-selection-toolbar) for details.

## Displaying saved maps

To render saved maps on a page (outside the editor), include the `quill_content_scripts()` function in your template:

```twig
<twig:QuillContent :value="content" />

{{ quill_content_styles() }}
{{ quill_content_scripts() }} {# ← required: initializes the maps #}
```

The `quill_content_scripts()` function emits a Stimulus controller element (`data-controller="ehyiah--ux-quill--quill-maps"`) that automatically initializes all `.ql-map` elements on the page.

> **AssetMapper / importmap:** the display page must render the importmap (`importmap('app')`, usually in `base.html.twig`) so the controller can be loaded. After updating the bundle, re-run `bin/console importmap:install`.
>
> **Webpack Encore:** the `quill-maps` controller is registered via `@symfony/stimulus-bridge` from `assets/controllers.json`. After updating the bundle, run `bin/console ux:controllers:dump` (or add the `quill-maps` entry manually), then rebuild your assets (`yarn watch` / `yarn build`).
>
> See [Usage → Loading the required JavaScript](/guide/usage#loading-the-required-javascript-maps) for when `quill_content_scripts()` is needed, and the [module documentation](/guide/modules/map#displaying-saved-maps) for details.

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="map"
    placeholder="Click the map button to insert a map…"
  />
</ClientOnly>
