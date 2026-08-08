<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class DividerModule implements ModuleInterface
{
    public const NAME = 'divider';

    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
    }
}
