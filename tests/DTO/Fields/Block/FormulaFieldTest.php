<?php

namespace DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\AlignField
 */
final class FormulaFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $alignField = new FormulaField();

        $result = $alignField->getOption();

        $expectedResult = 'formula';

        $this->assertEquals($expectedResult, $result);
    }
}
