<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\LayoutModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class LayoutModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new LayoutModule();

        $this->assertEquals('layout', $module->name);
        $this->assertCount(4, $module->options['presets']);
        $this->assertTrue($module->options['allow_wrap']);
    }

    public function testDefaultPresetStructure(): void
    {
        $module = new LayoutModule();
        $preset = $module->options['presets'][0];

        $this->assertArrayHasKey('cols', $preset);
        $this->assertArrayHasKey('ratios', $preset);
        $this->assertArrayHasKey('label', $preset);
        $this->assertEquals(2, $preset['cols']);
        $this->assertEquals(['1fr', '1fr'], $preset['ratios']);
        $this->assertEquals('50/50', $preset['label']);
    }

    public function testCustomPresets(): void
    {
        $module = new LayoutModule(options: [
            'presets' => [
                ['cols' => 4, 'ratios' => ['1fr', '1fr', '1fr', '1fr'], 'label' => '4 cols'],
            ],
            'allow_wrap' => false,
        ]);

        $this->assertCount(1, $module->options['presets']);
        $this->assertFalse($module->options['allow_wrap']);
        $this->assertEquals(4, $module->options['presets'][0]['cols']);
    }

    public function testNameOverride(): void
    {
        $module = new LayoutModule(name: 'customLayout');
        $this->assertEquals('customLayout', $module->name);
    }
}
