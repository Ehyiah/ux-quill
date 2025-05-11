<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class CounterModule implements ModuleInterface
{
    public const NAME = 'counter';

    /**
     * @param array<string, string|bool> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [
            'words' => true,
            'words_label' => 'Number of words : ',
            'words_container' => '',
            'characters' => true,
            'characters_label' => 'Number of characters : ',
            'characters_container' => '',
        ],
    ) {
    }
}
