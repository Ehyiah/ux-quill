<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField
 */
final class HeaderFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new HeaderField();
        $result = $field->getOption();
        $expectedResult = ['header' => 1];

        $this->assertEquals($expectedResult, $result);

        $field = new HeaderField(HeaderField::HEADER_OPTION_2);
        $result = $field->getOption();
        $expectedResult = ['header' => 2];

        $this->assertEquals($expectedResult, $result);
    }
}
