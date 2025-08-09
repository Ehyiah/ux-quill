<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the Synonym is required in your Form
 * Will be registered automatically
 * For more options see https://github.com/uluumbch/quill-synonym
 */
final class SynonymModule implements ModuleInterface
{
    public const NAME = 'synonym';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public $options = true,
    ) {
    }
}
