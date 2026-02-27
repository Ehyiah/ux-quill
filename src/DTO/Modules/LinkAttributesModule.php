<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class LinkAttributesModule implements ModuleInterface
{
    public const NAME = 'linkAttributes';

    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
    }
}
