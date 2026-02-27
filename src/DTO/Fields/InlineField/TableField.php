<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\TableModule;

class TableField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public const NAME = 'table-better';

    public function getOption(): string
    {
        return self::NAME;
    }

    public static function importModules(): array
    {
        return [TableModule::class];
    }
}
