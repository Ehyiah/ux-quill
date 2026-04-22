<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable a Notion-like toolbar (floating selection toolbar and slash command menu)
 */
final class NotionToolbarModule implements ModuleInterface
{
    public const NAME = 'notionToolbar';

    /**
     * @param array{
     *     slashMenu?: bool,
     *     floatingToolbar?: bool,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
        $this->options = array_merge([
            'slashMenu' => true,
            'floatingToolbar' => true,
        ], $this->options);
    }
}
