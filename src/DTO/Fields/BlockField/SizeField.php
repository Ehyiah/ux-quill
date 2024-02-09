<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class SizeField implements QuillBlockFieldInterface
{
    public const SIZE_FIELD_OPTION_SMALL = 'small';
    public const SIZE_FIELD_OPTION_NORMAL = false;
    public const SIZE_FIELD_OPTION_LARGE = 'large';
    public const SIZE_FIELD_OPTION_HUGE = 'huge';

    /**
     * @var bool[]|string[]
     */
    private array $options;

    public function __construct(bool|string ...$options)
    {
        $this->options = $options;
    }

    /**
     * @return array|mixed[]
     */
    public function getOption(): array
    {
        $array = [];
        $array['size'] = $this->options;

        return $array;
    }
}
