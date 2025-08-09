<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class SynonymModule implements ModuleInterface
{
    public const NAME = 'synonym';

    /**
     * see for more details on supported languages https://github.com/commonsense/conceptnet5/wiki/Languages
     */
    public const LANG_OPTION = 'lang';


    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public $options = [
            self::LANG_OPTION => 'fr',
        ],
    ) {
    }
}
