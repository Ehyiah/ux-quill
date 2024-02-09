<?php

namespace Ehyiah\QuillJsBundle\DTO;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillGroupInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class QuillGroup implements QuillGroupInterface
{
    /**
     * @return array<int<0, max>, array<string>|string>
     */
    public static function build(QuillBlockFieldInterface|QuillInlineFieldInterface ...$fields): array
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
