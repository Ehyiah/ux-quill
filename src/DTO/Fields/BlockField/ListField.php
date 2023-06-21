<?php

namespace Ehyiah\QuillJs\DTO\Fields\BlockField;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class ListField implements QuillBlockFieldInterface
{
    public const LIST_FIELD_OPTION_ORDERED = 'ordered';
    public const LIST_FIELD_OPTION_BULLET = 'bullet';

    private array $options;

    public function __construct(string ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        foreach ($this->options as $option) {
            $array[] = ['list' => $option];
        }

        return $array;
    }
}
