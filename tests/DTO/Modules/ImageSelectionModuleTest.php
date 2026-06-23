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

        $this->assertArrayHasKey('sectionLabels', $module->options);
        $this->assertEquals('Size', $module->options['sectionLabels']['size']);
    }

    public function testEmptyLabelsOption(): void
    {
        $module = new ImageSelectionModule('imageSelection', [
            'sectionLabels' => [],
        ]);

        $this->assertArrayHasKey('sectionLabels', $module->options);
        $this->assertEmpty($module->options['sectionLabels']);
    }

    public function testNullLabelsOption(): void
    {
        $module = new ImageSelectionModule('imageSelection', [
            'sectionLabels' => null,
        ]);

        $this->assertArrayHasKey('sectionLabels', $module->options);
        $this->assertEmpty($module->options['sectionLabels']);
    }

    public function testCustomOptions(): void
    {
        $module = new ImageSelectionModule('imageSelection', [
            'rotateLeftTitle' => 'Tourner à gauche',
            'alignLabels' => [
                'left' => 'Gauche',
            ],
            'sectionLabels' => [
                'size' => 'Taille',
            ],
        ]);

        $this->assertEquals('Tourner à gauche', $module->options['rotateLeftTitle']);
        $this->assertEquals('Rotate right', $module->options['rotateRightTitle']);
        $this->assertEquals('Gauche', $module->options['alignLabels']['left']);
        $this->assertEquals('Left (no wrap)', $module->options['alignLabels']['leftBlock']);

        $this->assertEquals('Taille', $module->options['sectionLabels']['size']);
        $this->assertEquals('Align', $module->options['sectionLabels']['align']);
    }
}
