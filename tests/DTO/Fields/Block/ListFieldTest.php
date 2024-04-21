<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ListField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ListField
 */
final class ListFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new ListField(ListField::LIST_FIELD_OPTION_ORDERED);
        $result = $field->getOption();
        $expectedResult = ['list' => 'ordered'];

        $this->assertEquals($expectedResult, $result);

        $field = new ListField(ListField::LIST_FIELD_OPTION_BULLET);
        $result = $field->getOption();
        $expectedResult = ['list' => 'bullet'];

        $this->assertEquals($expectedResult, $result);

        $field = new ListField(ListField::LIST_FIELD_OPTION_CHECK);
        $result = $field->getOption();
        $expectedResult = ['list' => 'check'];

        $this->assertEquals($expectedResult, $result);
    }
}
