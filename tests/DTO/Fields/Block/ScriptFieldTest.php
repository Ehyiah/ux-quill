<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Block;

use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ScriptField;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\BlockField\ScriptField
 */
final class ScriptFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     */
    public function testGetOptionWithTrueValues(): void
    {
        $field = new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUB);
        $result = $field->getOption();
        $expectedResult = ['script' => 'sub'];

        $this->assertEquals($expectedResult, $result);

        $field = new ScriptField(ScriptField::SCRIPT_FIELD_OPTION_SUPER);
        $result = $field->getOption();
        $expectedResult = ['script' => 'super'];

        $this->assertEquals($expectedResult, $result);
    }
}
