<?php

namespace Ehyiah\QuillJs\DTO;

use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillGroupInterface;
use Ehyiah\QuillJs\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class QuillGroup implements QuillGroupInterface
{
    public static function build(QuillInlineFieldInterface|QuillBlockFieldInterface ...$fields): array
    {
        $array = [];
        foreach ($fields as $field) {
            if ($field instanceof QuillInlineFieldInterface) {
                $array[] = $field->getOption();
            }
            if ($field instanceof QuillBlockFieldInterface) {
                foreach ($field->getOption() as $key => $option) {
                    $array[][$key] = $option;
                }
            }
        }

        return $array;
    }
}
