<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * To be used if the AdvancedTableField is required in your Form
 * Will be registered automatically
 */
final class AdvancedTableModule implements ModuleInterface
{
    public const NAME = 'advanced-table';

    public const MENU_OPTION = 'menus';
    public const TOOLBAR_OPTION = 'toolbar';
    public const RESIZE_OPTION = 'resize';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, mixed>
         */
        public $options = [
            self::MENU_OPTION => true,
            self::TOOLBAR_OPTION => true,
            self::RESIZE_OPTION => true,
        ],
    ) {
    }
}
