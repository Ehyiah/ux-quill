<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * For options explanation see https://quilljs.com/docs/modules/history
 */
final class HistoryModule implements ModuleInterface
{
    public const NAME = 'history';

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
            'delay' => '1000',
            'maxStack' => '100',
            'userOnly' => 'false',
        ];
    }
}
