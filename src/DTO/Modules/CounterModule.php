<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class CounterModule implements ModuleInterface
{
    public const NAME = 'counter';

    /**
     * @var array<string, string|bool>
     */
    public array $options;

    /**
     * @param array<string, string|bool> $options
     */
    public function __construct(
        public string $name = self::NAME,
        array $options = [],
    ) {
        $this->options = array_merge($this->getDefaultOptions(), $options);
    }

    /**
     * @return array<string, string|bool>
     */
    private function getDefaultOptions(): array
    {
        return [
            'words' => true,
            'words_label' => 'Number of words : ',
            'words_container' => '',
            'characters' => true,
            'characters_label' => 'Number of characters : ',
            'characters_container' => '',
        ];
    }
}
