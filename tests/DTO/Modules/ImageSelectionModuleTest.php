<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\ImageSelectionModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
final class ImageSelectionModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new ImageSelectionModule();

        $this->assertEquals(ImageSelectionModule::NAME, $module->name);
        $this->assertArrayHasKey('alignLabels', $module->options);
        $this->assertEquals('Left (wrapped)', $module->options['alignLabels']['left']);
        $this->assertEquals('Rotate left', $module->options['rotateLeftTitle']);
        $this->assertEquals('Rotate right', $module->options['rotateRightTitle']);
    }

    public function testCustomOptions(): void
    {
        $module = new ImageSelectionModule('imageSelection', [
            'rotateLeftTitle' => 'Tourner à gauche',
            'alignLabels' => [
                'left' => 'Gauche',
            ],
        ]);

        $this->assertEquals('Tourner à gauche', $module->options['rotateLeftTitle']);
        $this->assertEquals('Rotate right', $module->options['rotateRightTitle']);
        $this->assertEquals('Gauche', $module->options['alignLabels']['left']);
        $this->assertEquals('Left (no wrap)', $module->options['alignLabels']['leftBlock']);
    }
}
