<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

class SyntaxModule
{
    public const NAME = 'syntax';

    public function __construct(
        public string $name = self::NAME,
        public string $options = 'true',
    ) {
    }
}
