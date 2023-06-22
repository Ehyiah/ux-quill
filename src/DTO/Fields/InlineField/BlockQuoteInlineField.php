<?php

namespace Ehyiah\QuillJsBundleBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundleBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class BlockQuoteInlineField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'blockquote';
    }
}
