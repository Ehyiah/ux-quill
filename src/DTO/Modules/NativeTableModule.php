<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * Required to enable native Quill table support
 */
final class NativeTableModule implements ModuleInterface
{
    public const NAME = 'table';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var bool|array<string, mixed>
         */
        public $options = true,
    ) {
    }
}
