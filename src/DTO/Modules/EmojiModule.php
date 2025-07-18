<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the EmojiField is required in your Form
 * Will be registered automatically
 */
final class EmojiModule implements ModuleInterface
{
    public const NAME = 'emoji-toolbar';

    /**
     * @param string $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = 'true',
    ) {
    }
}
