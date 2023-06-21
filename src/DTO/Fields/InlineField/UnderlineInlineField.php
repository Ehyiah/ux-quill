<?php

namespace Ehyiah\QuillJs\DTO\Fields\InlineField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class UnderlineInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'underline';
    }
}
