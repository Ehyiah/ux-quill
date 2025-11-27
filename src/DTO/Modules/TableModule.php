<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class TableModule implements ModuleInterface
{
    public const NAME = 'table';

    public const DEFAULT_ROWS_OPTION = 'defaultRows';
    public const DEFAULT_COLS_OPTION = 'defaultCols';
    public const SHOW_UI_OPTION = 'showUI';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, int|bool>
         */
        public $options = [
            // These values are used as fallbacks when showUI is false
            self::DEFAULT_ROWS_OPTION => 3,
            self::DEFAULT_COLS_OPTION => 3,
            self::SHOW_UI_OPTION => true,
        ],
    ) {
    }
}
