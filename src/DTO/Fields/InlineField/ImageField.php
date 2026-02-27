<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;

class ImageField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'image';
    }

    public static function importModules(): array
    {
        return [ResizeModule::class, NodeMoverModule::class];
    }
}
