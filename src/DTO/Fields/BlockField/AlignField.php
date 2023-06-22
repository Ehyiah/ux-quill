<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class AlignField implements QuillBlockFieldInterface
{
    public const ALIGN_FIELD_OPTION_LEFT = false;
    public const ALIGN_FIELD_OPTION_CENTER = 'center';
    public const ALIGN_FIELD_OPTION_RIGHT = 'right';
    public const ALIGN_FIELD_OPTION_JUSTIFY = 'justify';

    private array $options;

    public function __construct(string|bool ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        $array['align'] = $this->options;

        return $array;
    }
}
