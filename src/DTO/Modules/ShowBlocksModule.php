<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ShowBlocksModule implements ModuleInterface
{
    public const NAME = 'showBlocks';

    public const MENU_OPTION = 'enabled';
    public const MENU_CONFIRM_DELETION = 'confirmDeletion';
    public const MENU_TOOLBAR_ICON = 'toolbarIcon';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public $options = [
            self::MENU_OPTION => false,
            self::MENU_CONFIRM_DELETION => false,
        ],
    ) {
    }
}
