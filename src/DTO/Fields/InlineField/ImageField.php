<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class ImageField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'image';
    }
}
