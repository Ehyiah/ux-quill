<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\Interfaces;

interface QuillGroupInterface
{
    public static function build(QuillInlineFieldInterface ...$fields): array;
}
