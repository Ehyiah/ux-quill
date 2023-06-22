<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class StrikeInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'strike';
    }
}
