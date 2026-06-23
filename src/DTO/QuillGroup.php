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
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\DividerField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\LinkField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\PageBreakField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\StrikeField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TableField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\VideoField;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillBlockFieldInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillGroupInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

final class QuillGroup implements QuillGroupInterface
{
    /**
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     */
    public static function build(QuillBlockFieldInterface|QuillInlineFieldInterface ...$fields): array
    {
        return $fields;
    }

    /**
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     *
     * @deprecated since 3.9, will be removed in 4.0.
     *     Some Field‑dependent modules (e.g. SpoilerField, MentionField, ImageGallery...) cannot
     *     be auto‑included here because they need explicit configuration in their modules. Use other presets or QuillGroup::build() with explicit
     *     fields instead.
     */
    public static function buildWithAllFields(): array
    {
        @trigger_error(sprintf(
            'The "%s()" method is deprecated since 3.9 and will be removed in 4.0. Use "%s()" with other presets instead.',
            __METHOD__,
            self::class . '::build'
        ), E_USER_DEPRECATED);

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
            new DividerField(),
            new PageBreakField(),
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
            new TableField(),
        ];

        return array_merge($stylingFields, $orgaFields, $otherFields);
    }

    /**
     * Lightweight toolbar suitable for comments, short descriptions or note fields.
     *
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     */
    public static function buildMinimal(): array
    {
        return [
            new BoldField(),
            new ItalicField(),
            new UnderlineField(),
            new LinkField(),
            new CleanField(),
        ];
    }

    /**
     * Toolbar tailored for newsletters: text emphasis, headings, colors,
     * alignment, lists and inline images. Excludes technical fields (code,
     * formula, table, video, script, RTL direction).
     *
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     */
    public static function buildForNewsletter(): array
    {
        return [
            new BoldField(),
            new ItalicField(),
            new UnderlineField(),
            new StrikeField(),
            new LinkField(),
            new HeaderGroupField(),
            new ColorField(),
            new BackgroundColorField(),
            new AlignField(),
            new ListField(),
            new ListField(ListField::LIST_FIELD_OPTION_BULLET),
            new ImageField(),
            new CleanField(),
        ];
    }

    /**
     * Richer toolbar for editorial / blog content. Drops very specialised
     * fields (formula, script, RTL direction, font, emoji) from the full set.
     *
     * @return array<QuillBlockFieldInterface|QuillInlineFieldInterface>
     */
    public static function buildAdvanced(): array
    {
        return [
            new BoldField(),
            new ItalicField(),
            new UnderlineField(),
            new StrikeField(),
            new BlockQuoteField(),
            new LinkField(),
            new HeaderGroupField(),
            new SizeField(),
            new ColorField(),
            new BackgroundColorField(),
            new AlignField(),
            new IndentField(),
            new ListField(),
            new ListField(ListField::LIST_FIELD_OPTION_BULLET),
            new ListField(ListField::LIST_FIELD_OPTION_CHECK),
            new ImageField(),
            new VideoField(),
            new DividerField(),
            new PageBreakField(),
            new CodeField(),
            new CodeBlockField(),
            new TableField(),
            new CleanField(),
        ];
    }
}
