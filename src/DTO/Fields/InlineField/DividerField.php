<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;

final class DividerField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'divider';
    }

    public static function importModules(): array
    {
        return [DividerModule::class];
    }
}
