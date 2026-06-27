<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\MapField;
use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\MapField
 */
final class MapFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testField(): void
    {
        $field = new MapField();
        $this->assertEquals('map', $field->getOption());
        $this->assertEquals([MapModule::class], MapField::importModules());
    }
}
