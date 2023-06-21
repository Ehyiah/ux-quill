<?php

namespace Ehyiah\QuillJs\DTO\Fields\BlockField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class ColorField implements QuillBlockFieldInterface
{
    private array $options = [];

    public function __construct(string ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        $array['color'] = $this->options;

        return $array;
    }
}
