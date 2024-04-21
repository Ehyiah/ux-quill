<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\InlineField;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class VideoField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        return 'video';
    }
}
