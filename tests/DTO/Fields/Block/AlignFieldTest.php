<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\AlignField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\AlignField
 */
final class AlignFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $alignField = new AlignField(
            AlignField::ALIGN_FIELD_OPTION_LEFT,
            AlignField::ALIGN_FIELD_OPTION_CENTER,
        );

        $result = $alignField->getOption();

        $expectedResult = [
            'align' => [
                AlignField::ALIGN_FIELD_OPTION_LEFT,
                AlignField::ALIGN_FIELD_OPTION_CENTER,
            ],
        ];

        $this->assertEquals($expectedResult, $result);
    }

    /**
     * @covers ::getOption
     */
    public function testGetOptionWithFalseValue(): void
    {
        $alignField = new AlignField(false);

        $result = $alignField->getOption();

        $expectedResult = [
            'align' => [false],
        ];

        $this->assertEquals($expectedResult, $result);
    }
}
