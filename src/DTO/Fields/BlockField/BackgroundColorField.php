<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class BackgroundColorField implements QuillBlockFieldInterface
{
    /**
     * @var string[]
     */
    private array $options = [];

    public function __construct(string ...$options)
    {
        $this->options = $options;
    }

    /**
     * @return array<string, array<string>>
     */
    public function getOption(): array
    {
        $array = [];
        $array['background'] = $this->options;

        return $array;
    }
}
