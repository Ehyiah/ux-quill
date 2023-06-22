<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class CleanInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'clean';
    }
}
