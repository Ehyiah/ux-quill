<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class SmartLinksModule implements ModuleInterface
{
    public const NAME = 'smartLinks';

    /**
     * @param array<string, string> $options
     */
    public function __construct(
        public $options = [
            'linkRegex' => '/https?:\/\/[^\s]+/',
        ],
        public string $name = self::NAME,
    ) {
    }
}
