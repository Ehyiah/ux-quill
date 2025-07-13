<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class HeaderField implements QuillBlockFieldInterface
{
    public const HEADER_OPTION_1 = 1;
    public const HEADER_OPTION_2 = 2;

    private int $options;

    public function __construct(int $options = self::HEADER_OPTION_1)
    {
        $this->options = $options;
    }

    /**
     * @return int[]
     */
    public function getOption(): array
    {
        $array = [];
        $array['header'] = $this->options;

        return $array;
    }
}
