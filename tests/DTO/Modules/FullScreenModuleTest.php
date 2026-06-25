<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule
 */
final class FullScreenModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new FullScreenModule();
        $this->assertEquals('toggleFullscreen', $module->name);
        $this->assertEquals('Toggle fullscreen mode', $module->options['buttonTitle']);
        $this->assertStringContainsString('<svg', $module->options['buttonHTML']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new FullScreenModule(options: [
            'buttonTitle' => 'Plein écran',
        ]);
        $this->assertEquals('Plein écran', $module->options['buttonTitle']);
    }
}
