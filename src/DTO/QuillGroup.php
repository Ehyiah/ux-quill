<?php

namespace Ehyiah\QuillJsBundle\DTO;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\AlignField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\BackgroundColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\DirectionField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\FontField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\IndentField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ListField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ScriptField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\SizeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BlockQuoteInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CleanInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LinkInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\StrikeInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineInlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoInlineField;
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

    /**
     * @return array<int<0, max>, array<string>|string>
     */
    public static function buildWithAllFields(): array
    {
        $fields = [
            new AlignField(),
            new ColorField(),
            new BackgroundColorField(),
            new DirectionField(),
            new HeaderField(),
            new HeaderGroupField(),
            new IndentField(),
            new ListField(),
            new ListField(ListField::LIST_FIELD_OPTION_BULLET),
            new ListField(ListField::LIST_FIELD_OPTION_CHECK),
            new ScriptField(),
            new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUPER),
            new SizeField(),
            new BlockQuoteInlineField(),
            new BoldInlineField(),
            new CleanInlineField(),
            new CodeBlockInlineField(),
            new CodeInlineField(),
            new EmojiField(),
            new ImageInlineField(),
            new ItalicInlineField(),
            new StrikeInlineField(),
            new UnderlineInlineField(),
            new VideoInlineField(),
            new LinkInlineField(),
            new FontField(),
            new FormulaField(),
        ];

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
