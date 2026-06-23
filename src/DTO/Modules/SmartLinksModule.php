<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

class SmartLinksModule implements ModuleInterface
{
    public const NAME = 'smartLinks';

    /**
     * @var array<string, string>
     */
    public array $options;

    /**
     * @param array<string, string> $options
     */
    public function __construct(
        public string $name = self::NAME,
        array $options = [],
    ) {
        $this->options = array_merge($this->getDefaultOptions(), $options);
    }

    /**
     * @return array<string, string>
     */
    private function getDefaultOptions(): array
    {
        return [
            'linkRegex' => '/https?:\/\/[^\s]+/',
        ];
    }
}
