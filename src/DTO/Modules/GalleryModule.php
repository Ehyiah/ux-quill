<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class GalleryModule implements ModuleInterface
{
    public const NAME = 'mediaGallery';

    /**
     * @param array<string, string|bool> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [
            'uploadEndpoint' => '', // endpoint to upload images from the gallery
            'listEndpoint' => '', // public endpoint to list images
            'icon' => '', // icon used in the toolbar
        ],
    ) {
    }
}
