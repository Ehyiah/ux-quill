<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\DividerField;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\DividerField
 */
class DividerFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testDividerField(): void
    {
        $field = new DividerField();
        $this->assertEquals('divider', $field->getOption());
        $this->assertEquals([DividerModule::class], DividerField::importModules());
    }
}
