<?php

namespace Ehyiah\QuillJsBundle\DTO\Fields\Interfaces;

interface QuillGroupInterface
{
    /**
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     */
    public static function build(QuillBlockFieldInterface|QuillInlineFieldInterface ...$fields): array;
}
