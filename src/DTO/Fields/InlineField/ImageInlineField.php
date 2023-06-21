<?php

namespace Ehyiah\QuillJs\DTO\Fields\InlineField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class ImageInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'image';
    }
}
