<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderGroupField
 */
final class HeaderGroupFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new HeaderGroupField();
        $result = $field->getOption();
        $expectedResult = ['header' => []];

        $this->assertEquals($expectedResult, $result);

        $field = new HeaderGroupField(HeaderGroupField::HEADER_OPTION_1, HeaderGroupField::HEADER_OPTION_3);
        $result = $field->getOption();
        $expectedResult = ['header' => [1, 3]];

        $this->assertEquals($expectedResult, $result);
    }
}
