<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\BlockField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;

final class ScriptField implements QuillBlockFieldInterface
{
    public const SCRIPT_FIELD_OPTION_SUB = 'sub';
    public const SCRIPT_FIELD_OPTION_SUPER = 'super';

    private array $options = [];

    public function __construct(string ...$options)
    {
        $this->options = $options;
    }

    public function getOption(): array
    {
        $array = [];
        $array['script'] = $this->options;

        return $array;
    }
}
