<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class SpoilerModule implements ModuleInterface
{
    public const NAME = 'spoiler';

    /**
     * @param array{title?: string, content?: string} $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [
            'title' => 'Spoiler',
            'content' => '',
        ],
    ) {
    }
}
