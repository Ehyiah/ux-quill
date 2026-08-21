<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\MapSelectionModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\MapSelectionModule
 */
final class MapSelectionModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultValues(): void
    {
        $module = new MapSelectionModule();

        $this->assertEquals('mapSelection', $module->name);
        $this->assertIsArray($module->options);
        $this->assertArrayHasKey('borderColor', $module->options);
        $this->assertEquals('#007bff', $module->options['borderColor']);
        $this->assertArrayHasKey('editLocationTitle', $module->options);
        $this->assertEquals('Edit location', $module->options['editLocationTitle']);
        $this->assertArrayHasKey('buttonBeforeLabel', $module->options);
        $this->assertEquals('¶+', $module->options['buttonBeforeLabel']);
        $this->assertArrayHasKey('buttonAfterLabel', $module->options);
        $this->assertEquals('+¶', $module->options['buttonAfterLabel']);
        $this->assertArrayHasKey('buttonBeforeTitle', $module->options);
        $this->assertEquals('Insert a paragraph before', $module->options['buttonBeforeTitle']);
        $this->assertArrayHasKey('buttonAfterTitle', $module->options);
        $this->assertEquals('Insert a paragraph after', $module->options['buttonAfterTitle']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptionsMerge(): void
    {
        $module = new MapSelectionModule(options: ['borderColor' => '#ff0000', 'deleteTitle' => 'Supprimer']);

        $this->assertEquals('#ff0000', $module->options['borderColor']);
        $this->assertEquals('Supprimer', $module->options['deleteTitle']);
        $this->assertEquals('Edit location', $module->options['editLocationTitle']);
    }

    /**
     * @covers ::__construct
     */
    public function testDisabledModule(): void
    {
        $module = new MapSelectionModule(options: false);

        $this->assertFalse($module->options);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomSectionLabels(): void
    {
        $module = new MapSelectionModule(options: ['sectionLabels' => ['align' => 'Alignement']]);

        $this->assertEquals('Alignement', $module->options['sectionLabels']['align']);
        $this->assertEquals('Map', $module->options['sectionLabels']['map']);
        $this->assertEquals('Size', $module->options['sectionLabels']['size']);
        $this->assertEquals('Insert', $module->options['sectionLabels']['insert']);
    }

    /**
     * @covers ::__construct
     */
    public function testNullSectionLabels(): void
    {
        $module = new MapSelectionModule(options: ['sectionLabels' => null]);

        $this->assertEmpty($module->options['sectionLabels']);
    }
}
