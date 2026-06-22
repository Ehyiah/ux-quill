<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CalloutField;
use Ehyiah\QuillJsBundle\DTO\Modules\CalloutModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class CalloutFieldTest extends TestCase
{
    public function testCalloutField(): void
    {
        $field = new CalloutField();
        $this->assertEquals('callout', $field->getOption());
        $this->assertEquals([CalloutModule::class], CalloutField::importModules());
    }
}
