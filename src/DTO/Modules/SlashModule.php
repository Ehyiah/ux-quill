<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable a slash command menu (type "/" to insert blocks)
 */
final class SlashModule implements ModuleInterface
{
    public const NAME = 'slashModule';

    /**
     * @param array<mixed> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
    }
}
