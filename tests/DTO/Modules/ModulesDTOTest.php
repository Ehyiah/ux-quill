<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\DividerModule;
use Ehyiah\QuillJsBundle\DTO\Modules\MarkdownModule;
use Ehyiah\QuillJsBundle\DTO\Modules\PageBreakModule;
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

    public function testPageBreakModule(): void
    {
        $module = new PageBreakModule();
        $this->assertEquals('pageBreak', $module->name);
        $this->assertEquals(['label' => 'Page Break'], $module->options);

        $module = new PageBreakModule(options: ['label' => 'Saut de page']);
        $this->assertEquals(['label' => 'Saut de page'], $module->options);
    }
}
