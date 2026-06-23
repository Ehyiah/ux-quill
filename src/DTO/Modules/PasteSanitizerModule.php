<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class PasteSanitizerModule implements ModuleInterface
{
    public const NAME = 'pasteSanitizer';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, mixed>
         */
        public $options = [],
    ) {
        $this->options = array_merge([
            'plain_text' => true,
        ], $this->options);
    }
}
