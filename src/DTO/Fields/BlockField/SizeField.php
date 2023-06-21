<?php

namespace Ehyiah\QuillJs\DTO\Fields\BlockField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class SizeField implements QuillBlockFieldInterface
{
    public const SIZE_FIELD_OPTION_SMALL = 'small';
    public const SIZE_FIELD_OPTION_NORMAL = false;
    public const SIZE_FIELD_OPTION_LARGE = 'large';
    public const SIZE_FIELD_OPTION_HUGE = 'huge';

    private array $options;

    public function __construct(string|bool ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        $array['size'] = $this->options;

        return $array;
    }
}
