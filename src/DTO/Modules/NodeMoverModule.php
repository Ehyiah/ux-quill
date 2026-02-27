<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable moving any block element (text, images, videos) with a toolbar and drag handle
 */
final class NodeMoverModule implements ModuleInterface
{
    public const NAME = 'nodeMover';

    /**
     * @param array{
     *     borderColor?: string,
     * } $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
        $this->options = array_merge([
            'borderColor' => '#007bff',
        ], $this->options);
    }
}
