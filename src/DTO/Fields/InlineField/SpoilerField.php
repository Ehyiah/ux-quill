<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\SpoilerModule;

final class SpoilerField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'spoiler';
    }

    public static function importModules(): array
    {
        return [SpoilerModule::class];
    }
}
