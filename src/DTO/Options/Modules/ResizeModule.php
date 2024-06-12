<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

final class ResizeModule implements ModuleInterface
{
    public const NAME = 'resize';

    /**
     * @param array<string, string> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
    }
}
