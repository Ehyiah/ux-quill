<?php

namespace Ehyiah\QuillJs\DTO\Fields\Interfaces;

interface QuillGroupInterface
{
    public static function build(QuillInlineFieldInterface ...$fields): array;
}
