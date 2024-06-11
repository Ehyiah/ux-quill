<?php

namespace Ehyiah\QuillJsBundle\DTO\Options\Modules;

final class EmojiModule implements ModuleInterface
{
    public const NAME = 'emoji-toolbar';

    public function __construct(
        public string $name = self::NAME,
        public string $options = "true",
    ) {
    }
}
