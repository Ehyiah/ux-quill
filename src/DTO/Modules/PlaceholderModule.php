<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class PlaceholderModule implements ModuleInterface
{
    public const NAME = 'placeholder';

    /**
     * @param array<string, array<string>|string|null> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [
            'placeholders' => [],
            'icon' => null,
            'startTag' => '{{',
            'endTag' => '}}',
        ],
    ) {
    }
}
