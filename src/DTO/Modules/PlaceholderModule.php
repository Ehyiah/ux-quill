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
        public $options = [],
    ) {
        $defaults = [
            'placeholders' => [],
            'icon' => null,
            'startTag' => '{{',
            'endTag' => '}}',
        ];

        $this->options = array_merge($defaults, $this->options);
    }
}
