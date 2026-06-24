<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TableField;
use Ehyiah\QuillJsBundle\DTO\Modules\TableModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Fields\InlineField\TableField
 */
final class TableFieldTest extends TestCase
{
    /**
     * @covers ::getOption
     * @covers ::importModules
     */
    public function testField(): void
    {
        $field = new TableField();
        $this->assertEquals('table-better', $field->getOption());
        $this->assertEquals([TableModule::class], TableField::importModules());
    }
}
