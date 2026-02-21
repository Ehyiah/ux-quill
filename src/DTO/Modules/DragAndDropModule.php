<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Module to enable internal drag and drop of elements (images, videos)
 */
final class DragAndDropModule implements ModuleInterface
{
    public const NAME = 'dragAndDrop';

    /**
     * @param array<string, mixed> $options
     */
    public function __construct(
        public string $name = self::NAME,
        public $options = [],
    ) {
    }
}
