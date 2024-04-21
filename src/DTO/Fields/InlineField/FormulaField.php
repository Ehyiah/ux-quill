<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class FormulaField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'formula';
    }
}
