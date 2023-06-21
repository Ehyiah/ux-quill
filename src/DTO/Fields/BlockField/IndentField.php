<?php

namespace Ehyiah\QuillJs\DTO\Fields\BlockField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class IndentField implements QuillBlockFieldInterface
{
    public const INDENT_FIELD_OPTION_MINUS = '-1';
    public const INDENT_FIELD_OPTION_PLUS = '+1';

    private string $option;

    public function __construct(string $option = self::INDENT_FIELD_OPTION_PLUS)
    {
        $this->option = $option;
    }

    public function getOption(): array
    {
        $array = [];
        $array['indent'] = $this->option;

        return $array;
    }
}
