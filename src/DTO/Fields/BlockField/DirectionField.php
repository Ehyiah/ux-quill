<?php

namespace Ehyiah\QuillJs\DTO\Fields\BlockField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class DirectionField implements QuillBlockFieldInterface
{
    public const DIRECTION_FIELD_OPTION_RTL = 'rtl';

    private string $options;

    public function __construct(?string $option = self::DIRECTION_FIELD_OPTION_RTL)
    {
        $this->options = $option;
    }

    public function getOption(): array
    {
        $array = [];
        $array['direction'] = $this->options;

        return $array;
    }
}
