<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class DirectionField implements QuillBlockFieldInterface
{
    public const DIRECTION_FIELD_OPTION_RTL = 'rtl';

    private string $options;

    public function __construct(string $option = self::DIRECTION_FIELD_OPTION_RTL)
    {
        $this->options = $option;
    }

    /**
     * @return string[]
     */
    public function getOption(): array
    {
        $array = [];
        $array['direction'] = $this->options;

        return $array;
    }
}
