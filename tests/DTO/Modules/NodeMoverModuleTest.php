<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule
 */
final class NodeMoverModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new NodeMoverModule();
        $this->assertEquals('nodeMover', $module->name);
        $this->assertTrue($module->options['active']);
        $this->assertNull($module->options['borderColor']);
        $this->assertEquals('#ff0000', $module->options['dropIndicatorColor']);
        $this->assertTrue($module->options['duplicate']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new NodeMoverModule(options: [
            'active' => false,
            'borderColor' => '#0000ff',
            'dropIndicatorColor' => '#00ff00',
            'duplicate' => false,
        ]);
        $this->assertFalse($module->options['active']);
        $this->assertEquals('#0000ff', $module->options['borderColor']);
        $this->assertEquals('#00ff00', $module->options['dropIndicatorColor']);
        $this->assertFalse($module->options['duplicate']);
    }
}
