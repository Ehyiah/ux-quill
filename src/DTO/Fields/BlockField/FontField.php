<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class FontField implements QuillBlockFieldInterface
{
    public const FONT_OPTION_SANS_SERIF = '';
    public const FONT_OPTION_SERIF = 'serif';
    public const FONT_OPTION_MONOSPACE = 'monospace';

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
        $array['font'] = $this->options;

        return $array;
    }
}
