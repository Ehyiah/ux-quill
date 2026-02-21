<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class AutosaveModule implements ModuleInterface
{
    public const NAME = 'autosave';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, mixed>
         */
        public $options = [],
    ) {
        $this->options = array_merge([
            'interval' => 2000,
            'restore_type' => 'manual', // 'manual' or 'auto'
            'key_suffix' => null,
        ], $this->options);
    }
}
