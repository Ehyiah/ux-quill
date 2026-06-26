<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\VideoSelectionModule
 */
final class VideoSelectionModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultValues(): void
    {
        $module = new VideoSelectionModule();

        $this->assertEquals('videoSelection', $module->name);
        $this->assertIsArray($module->options);
        $this->assertArrayHasKey('borderColor', $module->options);
        $this->assertEquals('#007bff', $module->options['borderColor']);
        $this->assertArrayHasKey('playTitle', $module->options);
        $this->assertEquals('Play video', $module->options['playTitle']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptionsMerge(): void
    {
        $module = new VideoSelectionModule(options: ['borderColor' => '#ff0000', 'playTitle' => 'Lire']);

        $this->assertEquals('#ff0000', $module->options['borderColor']);
        $this->assertEquals('Lire', $module->options['playTitle']);
        $this->assertEquals('Delete video', $module->options['deleteTitle']);
    }

    /**
     * @covers ::__construct
     */
    public function testDisabledModule(): void
    {
        $module = new VideoSelectionModule(options: false);

        $this->assertFalse($module->options);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomSectionLabels(): void
    {
        $module = new VideoSelectionModule(options: ['sectionLabels' => ['size' => 'Taille']]);

        $this->assertEquals('Taille', $module->options['sectionLabels']['size']);
        $this->assertEquals('Align', $module->options['sectionLabels']['align']);
    }

    /**
     * @covers ::__construct
     */
    public function testNullSectionLabels(): void
    {
        $module = new VideoSelectionModule(options: ['sectionLabels' => null]);

        $this->assertEmpty($module->options['sectionLabels']);
    }
}
