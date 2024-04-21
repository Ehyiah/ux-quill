<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class BoldField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'bold';
    }
}
