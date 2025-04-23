<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the TableField is required in your Form
 * Will be registered automatically
 * For more options see https://github.com/attoae/quill-table-better
 */
final class TableModule implements ModuleInterface
{
    public const NAME = 'table-better';

    public const MENU_OPTION = 'menus';
    public const LANGUAGE_OPTION = 'language';
    public const LANGUAGE_TOOLBAR_TABLE_OPTION = 'toolbarTable';
    public const LANGUAGE_WHITE_LIST_OPTION = 'whiteList';
    public const LANGUAGE_SINGLE_WHITE_LIST_OPTION = 'singleWhiteList';

    public const LANGUAGE_OPTION_EN_US = 'en_US';
    public const LANGUAGE_OPTION_FR_FR = 'fr_FR';
    public const LANGUAGE_OPTION_ZH_CN = 'zh_CN';
    public const LANGUAGE_OPTION_PL_PL = 'pl_PL';
    public const LANGUAGE_OPTION_RU_RU = 'ru_RU';
    public const LANGUAGE_OPTION_DE_DE = 'de_DE';
    public const LANGUAGE_OPTION_TR_TR = 'tr_TR';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public array $options = [
            self::MENU_OPTION => ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
            self::LANGUAGE_TOOLBAR_TABLE_OPTION => 'true', // must be set to true to show the table toolbar options
            self::LANGUAGE_OPTION => self::LANGUAGE_OPTION_EN_US,
        ],
    ) {
    }
}
