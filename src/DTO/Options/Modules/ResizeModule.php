<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

/**
 * To be used if the ImageField is required in your Form
 * Will be registered automatically with default options
 * Pass it in quill_extra_options modules option to customize
 */
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
