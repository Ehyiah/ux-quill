<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class EmojiField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'emoji';
    }
}
