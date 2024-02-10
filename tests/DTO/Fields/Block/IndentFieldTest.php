<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\IndentField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\IndentField
 */
final class IndentFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new IndentField();
        $result = $field->getOption();
        $expectedResult = ['indent' => +1];

        $this->assertEquals($expectedResult, $result);

        $field = new IndentField(IndentField::INDENT_FIELD_OPTION_MINUS);
        $result = $field->getOption();
        $expectedResult = ['indent' => -1];

        $this->assertEquals($expectedResult, $result);
    }
}
