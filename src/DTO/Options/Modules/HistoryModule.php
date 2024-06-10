<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

/**
 * For options explanation see https://quilljs.com/docs/modules/history
 */
final class HistoryModule implements ModuleInterface
{
    public const NAME = 'history';

    public function __construct(
        public string $delay = "1000",
        public string $maxStack = "100",
        public string $userOnly = "false",
    ) {
    }
}
