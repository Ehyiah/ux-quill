<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\MapModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\MapModule
 */
final class MapModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new MapModule();

        $this->assertEquals(MapModule::NAME, $module->name);
        $this->assertEquals('osm', $module->options[MapModule::PROVIDER_OPTION]);
        $this->assertEquals([48.8566, 2.3522], $module->options[MapModule::CENTER_OPTION]);
        $this->assertEquals(13, $module->options[MapModule::ZOOM_OPTION]);
        $this->assertNull($module->options[MapModule::GOOGLE_API_KEY_OPTION]);
        $this->assertNull($module->options[MapModule::TILE_URL_OPTION]);
        $this->assertEquals('300px', $module->options[MapModule::HEIGHT_OPTION]);
        $this->assertTrue($module->options[MapModule::SCROLL_WHEEL_ZOOM_OPTION]);
        $this->assertTrue($module->options[MapModule::DRAGGABLE_OPTION]);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new MapModule('map', [
            MapModule::PROVIDER_OPTION => 'google',
            MapModule::CENTER_OPTION => [51.5074, -0.1278],
            MapModule::ZOOM_OPTION => 10,
            MapModule::GOOGLE_API_KEY_OPTION => 'test-api-key',
            MapModule::TILE_URL_OPTION => 'https://custom-tiles.example.com/{z}/{x}/{y}.png',
            MapModule::HEIGHT_OPTION => '400px',
            MapModule::SCROLL_WHEEL_ZOOM_OPTION => false,
            MapModule::DRAGGABLE_OPTION => false,
        ]);

        $this->assertEquals('google', $module->options[MapModule::PROVIDER_OPTION]);
        $this->assertEquals([51.5074, -0.1278], $module->options[MapModule::CENTER_OPTION]);
        $this->assertEquals(10, $module->options[MapModule::ZOOM_OPTION]);
        $this->assertEquals('test-api-key', $module->options[MapModule::GOOGLE_API_KEY_OPTION]);
        $this->assertEquals('https://custom-tiles.example.com/{z}/{x}/{y}.png', $module->options[MapModule::TILE_URL_OPTION]);
        $this->assertEquals('400px', $module->options[MapModule::HEIGHT_OPTION]);
        $this->assertFalse($module->options[MapModule::SCROLL_WHEEL_ZOOM_OPTION]);
        $this->assertFalse($module->options[MapModule::DRAGGABLE_OPTION]);
    }

    /**
     * @covers ::__construct
     */
    public function testPartialOptionsMerge(): void
    {
        $module = new MapModule('map', [
            MapModule::ZOOM_OPTION => 16,
        ]);

        $this->assertEquals('osm', $module->options[MapModule::PROVIDER_OPTION]);
        $this->assertEquals(16, $module->options[MapModule::ZOOM_OPTION]);
        $this->assertEquals([48.8566, 2.3522], $module->options[MapModule::CENTER_OPTION]);
    }
}
