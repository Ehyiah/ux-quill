<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ImageAttributesModule implements ModuleInterface
{
    public const NAME = 'imageAttributes';

    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
    }
}
