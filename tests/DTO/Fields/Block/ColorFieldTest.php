<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ColorField
 */
final class ColorFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new ColorField(
            'green', 'red', 'yellow'
        );

        $result = $field->getOption();

        $expectedResult = [
            'color' => [
                'green', 'red', 'yellow',
            ],
        ];

        $this->assertEquals($expectedResult, $result);
    }
}
