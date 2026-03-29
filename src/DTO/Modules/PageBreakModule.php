<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class PageBreakModule implements ModuleInterface
{
    public const NAME = 'pageBreak';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string>
         */
        public $options = [
            'label' => 'Page Break',
        ],
    ) {
    }
}
