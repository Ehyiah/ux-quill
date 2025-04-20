<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the CodeBlock and is registered automatically
 */
class SyntaxModule implements ModuleInterface
{
    public const NAME = 'syntax';

    public function __construct(
        public string $name = self::NAME,
        public string $options = 'true',
    ) {
    }
}
