<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\DividerField;
use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class DividerFieldTest extends TestCase
{
    public function testDividerField(): void
    {
        $field = new DividerField();
        $this->assertEquals('divider', $field->getOption());
        $this->assertEquals([DividerModule::class], DividerField::importModules());
    }
}
