<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class BlockQuoteInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'blockquote';
    }
}
