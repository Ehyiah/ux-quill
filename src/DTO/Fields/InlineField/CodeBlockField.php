<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;

class CodeBlockField implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'code-block';
    }

    public static function importModules(): array
    {
        return [SyntaxModule::class];
    }
}
