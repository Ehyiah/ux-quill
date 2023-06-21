<?php

namespace Ehyiah\QuillJs\DTO\Fields\InlineField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class ItalicInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'italic';
    }
}
