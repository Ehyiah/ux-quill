<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\QuillGroup
 */
class QuillGroupTest extends TestCase
{
    /**
     * @covers ::build
     */
    public function testBuild(): void
    {
        $boldInlineField = new BoldField();
        $italicInlineField = new ItalicField();
        $colorBlockField = new ColorField('green');
        $headerBlockField = new HeaderGroupField(HeaderGroupField::HEADER_OPTION_1, HeaderGroupField::HEADER_OPTION_3);

        $result = QuillGroup::build($boldInlineField, $italicInlineField, $colorBlockField, $headerBlockField);

        $this->assertCount(4, $result);
        $this->assertInstanceOf(BoldField::class, $result[0]);
        $this->assertInstanceOf(ItalicField::class, $result[1]);
        $this->assertInstanceOf(ColorField::class, $result[2]);
        $this->assertInstanceOf(HeaderGroupField::class, $result[3]);
    }
}
