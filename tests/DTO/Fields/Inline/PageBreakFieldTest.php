<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\PageBreakField;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class PageBreakFieldTest extends TestCase
{
    public function testPageBreakField(): void
    {
        $field = new PageBreakField();
        $this->assertEquals('pageBreak', $field->getOption());
        $this->assertEquals([PageBreakModule::class], PageBreakField::importModules());
    }
}
