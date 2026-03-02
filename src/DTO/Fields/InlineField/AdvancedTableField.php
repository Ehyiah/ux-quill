<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\AdvancedTableModule;
use Ehyiah\QuillJsBundle\DTO\Modules\NativeTableModule;

class AdvancedTableField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public const NAME = 'advanced-table';

    public function getOption(): string
    {
        return self::NAME;
    }

    public static function importModules(): array
    {
        return [AdvancedTableModule::class, NativeTableModule::class];
    }
}
