<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField
 */
final class EmojiFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testField(): void
    {
        $field = new EmojiField();
        $this->assertEquals('emoji', $field->getOption());
        $this->assertEquals([EmojiModule::class], EmojiField::importModules());
    }
}
