<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * @deprecated will be removed in 4.0 in favor new default module ImageSelectionModule
 *
 * To be used if the ImageField is required in your Form
 * Will be registered automatically with default options
 * Pass it in quill_extra_options modules option to customize
 */
final class ResizeModule implements ModuleInterface
{
    public const NAME = 'resize';

    /**
     * @param array<string, string>|bool $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        if (!is_array($this->options)) {
            return;
        }
    }
}
