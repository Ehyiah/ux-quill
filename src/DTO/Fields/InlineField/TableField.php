<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class TableField implements QuillInlineFieldInterface
{
    public const NAME = 'table-better';

    public function getOption(): string
    {
        return self::NAME;
    }
}
