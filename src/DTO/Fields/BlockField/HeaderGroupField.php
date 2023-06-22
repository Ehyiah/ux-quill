<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class HeaderGroupField implements QuillBlockFieldInterface
{
    public const HEADER_OPTION_1 = 1;
    public const HEADER_OPTION_2 = 2;
    public const HEADER_OPTION_3 = 3;
    public const HEADER_OPTION_4 = 4;
    public const HEADER_OPTION_5 = 5;
    public const HEADER_OPTION_6 = 6;
    public const HEADER_OPTION_NORMAL = false;

    private array $options;

    public function __construct(int ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        $array['header'] = $this->options;

        return $array;
    }
}
