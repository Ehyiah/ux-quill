<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class MapModule implements ModuleInterface
{
    public const NAME = 'map';

    public const PROVIDER_OPTION = 'provider';
    public const CENTER_OPTION = 'center';
    public const ZOOM_OPTION = 'zoom';
    public const GOOGLE_API_KEY_OPTION = 'googleApiKey';
    public const TILE_URL_OPTION = 'tileUrl';
    public const HEIGHT_OPTION = 'height';
    public const SCROLL_WHEEL_ZOOM_OPTION = 'scrollWheelZoom';
    public const DRAGGABLE_OPTION = 'draggable';

    /**
     * @param array{
     *     provider?: string,
     *     center?: array{0: float, 1: float},
     *     zoom?: int,
     *     googleApiKey?: string|null,
     *     tileUrl?: string|null,
     *     height?: string,
     *     scrollWheelZoom?: bool,
     *     draggable?: bool,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            self::PROVIDER_OPTION => 'osm',
            self::CENTER_OPTION => [48.8566, 2.3522],
            self::ZOOM_OPTION => 13,
            self::GOOGLE_API_KEY_OPTION => null,
            self::TILE_URL_OPTION => null,
            self::HEIGHT_OPTION => '300px',
            self::SCROLL_WHEEL_ZOOM_OPTION => true,
            self::DRAGGABLE_OPTION => true,
        ], $this->options);
    }
}
