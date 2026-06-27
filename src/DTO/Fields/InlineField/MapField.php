<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;

final class MapField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'map';
    }

    public static function importModules(): array
    {
        return [MapModule::class];
    }
}
