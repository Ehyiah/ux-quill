<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\PlaceholderModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
final class PlaceholderModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new PlaceholderModule();

        $this->assertEquals('placeholder', $module->name);
        $this->assertEquals([], $module->options['placeholders']);
        $this->assertNull($module->options['icon']);
        $this->assertEquals('{{', $module->options['startTag']);
        $this->assertEquals('}}', $module->options['endTag']);
    }

    public function testCustomPlaceholders(): void
    {
        $module = new PlaceholderModule(options: [
            'placeholders' => ['firstName', 'lastName', 'email'],
        ]);

        $this->assertEquals(['firstName', 'lastName', 'email'], $module->options['placeholders']);
        $this->assertNull($module->options['icon']);
    }

    public function testCustomIcon(): void
    {
        $module = new PlaceholderModule(options: [
            'icon' => '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="4"/></svg>',
        ]);

        $this->assertEquals('<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="4"/></svg>', $module->options['icon']);
    }

    public function testCustomTags(): void
    {
        $module = new PlaceholderModule(options: [
            'startTag' => '[[',
            'endTag' => ']]',
        ]);

        $this->assertEquals('[[', $module->options['startTag']);
        $this->assertEquals(']]', $module->options['endTag']);
    }

    public function testPartialOptionsPreserveDefaults(): void
    {
        $module = new PlaceholderModule(options: [
            'startTag' => '${',
        ]);

        $this->assertEquals('${', $module->options['startTag']);
        $this->assertEquals('}}', $module->options['endTag']);
        $this->assertEquals([], $module->options['placeholders']);
        $this->assertNull($module->options['icon']);
    }
}
