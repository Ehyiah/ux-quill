<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class ListField implements QuillBlockFieldInterface
{
    public const LIST_FIELD_OPTION_ORDERED = 'ordered';
    public const LIST_FIELD_OPTION_BULLET = 'bullet';

    /**
     * @var string[]
     */
    private array $options;

    public function __construct(string ...$options)
    {
        $this->options = $options;
    }

    /**
     * @return array<int<0, max>, array<string, string>>
     */
    public function getOption(): array
    {
        $array = [];
        foreach ($this->options as $option) {
            $array['list'] =  $option;
        }

        return $array;
    }
}
