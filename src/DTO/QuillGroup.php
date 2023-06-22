<?php

namespace Ehyiah\QuillJsBundle\DTO;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillGroupInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

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
