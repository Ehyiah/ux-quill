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
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BlockQuoteField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CleanField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LinkField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\StrikeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
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
        $stylingFields = [
            new BoldField(),
            new ItalicField(),
            new UnderlineField(),
            new StrikeField(),
            new BlockQuoteField(),
            new LinkField(),
            new SizeField(),
            new HeaderField(),
            new HeaderGroupField(),
            new ColorField(),
            new IndentField(),
        ];

        $orgaFields = [
            new AlignField(),
            new BackgroundColorField(),
            new ListField(),
            new ListField(ListField::LIST_FIELD_OPTION_BULLET),
            new ListField(ListField::LIST_FIELD_OPTION_CHECK),
            new FontField(),
            new DirectionField(),
            new CodeField(),
            new CodeBlockField(),
            new ScriptField(),
            new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUPER),
            new FormulaField(),
        ];

        $otherFields = [
            new ImageField(),
            new VideoField(),
            new EmojiField(),
            new CleanField(),
        ];

        $fields = array_merge($stylingFields, $orgaFields, $otherFields);

        return self::build(...$fields);
    }
}
