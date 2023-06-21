<?php

namespace Ehyiah\QuillJs\DTO\Fields\InlineField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class LinkInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'link';
    }
}
