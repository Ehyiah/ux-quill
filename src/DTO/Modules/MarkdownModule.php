<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class MarkdownModule implements ModuleInterface
{
    public const NAME = 'markdown';

    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
    }
}
