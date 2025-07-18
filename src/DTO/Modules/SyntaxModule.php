<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the CodeBlock and is registered automatically
 */
class SyntaxModule implements ModuleInterface
{
    public const NAME = 'syntax';

    /**
     * @param string $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = 'true',
    ) {
    }
}
