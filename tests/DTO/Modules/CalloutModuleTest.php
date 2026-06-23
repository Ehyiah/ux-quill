<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\CalloutModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class CalloutModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new CalloutModule();

        $this->assertEquals('callout', $module->name);
        $this->assertEquals(['info', 'warning', 'danger', 'success'], $module->options['types']);
        $this->assertEquals('info', $module->options['defaultType']);
        $this->assertEquals('Info', $module->options['labels']['info']);
        $this->assertEquals('Warning', $module->options['labels']['warning']);
        $this->assertEquals('Danger', $module->options['labels']['danger']);
        $this->assertEquals('Success', $module->options['labels']['success']);
        $this->assertArrayHasKey('icons', $module->options);
    }

    public function testCustomOptions(): void
    {
        $module = new CalloutModule(options: [
            'types' => ['info', 'success'],
            'defaultType' => 'success',
            'labels' => [
                'info' => 'Information',
                'success' => 'Réussi',
            ],
        ]);

        $this->assertEquals(['info', 'success'], $module->options['types']);
        $this->assertEquals('success', $module->options['defaultType']);
        $this->assertEquals('Information', $module->options['labels']['info']);
        $this->assertEquals('Réussi', $module->options['labels']['success']);
    }

    public function testCustomName(): void
    {
        $module = new CalloutModule('custom-callout');

        $this->assertEquals('custom-callout', $module->name);
        $this->assertEquals('info', $module->options['defaultType']);
    }
}
