<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MarkdownModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ModulesDTOTest extends TestCase
{
    public function testDividerModule(): void
    {
        $module = new DividerModule();
        $this->assertEquals('divider', $module->name);
        $this->assertEquals([], $module->options);
    }

    public function testMarkdownModule(): void
    {
        $module = new MarkdownModule();
        $this->assertEquals('markdown', $module->name);
        $this->assertEquals([], $module->options);
    }
}
