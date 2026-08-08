<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\TableModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\TableModule
 */
final class TableModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new TableModule();
        $this->assertEquals('table-better', $module->name);
        $this->assertContains('column', $module->options['menus']);
        $this->assertContains('delete', $module->options['menus']);
        $this->assertEquals('true', $module->options['toolbarTable']);
        $this->assertEquals('en_US', $module->options['language']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new TableModule(options: [
            'language' => 'fr_FR',
            'menus' => ['column', 'row'],
        ]);
        $this->assertEquals('fr_FR', $module->options['language']);
        $this->assertEquals(['column', 'row'], $module->options['menus']);
    }
}
