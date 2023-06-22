<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class BoldInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'bold';
    }
}
