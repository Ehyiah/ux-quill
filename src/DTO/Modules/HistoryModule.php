<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * For options explanation see https://quilljs.com/docs/modules/history
 */
final class HistoryModule implements ModuleInterface
{
    public const NAME = 'history';

    /**
     * @param array<string, string> $options
     */
    public function __construct(
        public $options = [
            'delay' => '1000',
            'maxStack' => '100',
            'userOnly' => 'false',
        ],
        public string $name = self::NAME,
    ) {
    }
}
