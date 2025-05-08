<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class SmartLinksModule implements ModuleInterface
{
    public const NAME = 'smartLinks';

    /**
     * @param array<string, string> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [
            'linkRegex' => '/https?:\/\/[^\s]+/',
        ],
    ) {
    }
}
