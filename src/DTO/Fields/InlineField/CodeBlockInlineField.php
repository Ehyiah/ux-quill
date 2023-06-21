<?php

namespace Ehyiah\QuillJs\DTO\Fields\InlineField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class CodeBlockInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'code-block';
    }
}
