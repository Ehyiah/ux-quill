<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;

final class PageBreakField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'pageBreak';
    }

    public static function importModules(): array
    {
        return [PageBreakModule::class];
    }
}
