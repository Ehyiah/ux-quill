<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\DirectionField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\DirectionField
 */
final class DirectionFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new DirectionField('rtl');
        $result = $field->getOption();
        $expectedResult = ['direction' => 'rtl'];

        $this->assertEquals($expectedResult, $result);
    }
}
