<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\HtmlEditModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\HtmlEditModule
 */
final class HtmlEditModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new HtmlEditModule();
        $this->assertEquals('htmlEditButton', $module->name);
        $this->assertFalse($module->options['debug']);
        $this->assertFalse($module->options['syntax']);
        $this->assertFalse($module->options['closeOnClickOverlay']);
        $this->assertEquals('&lt;&gt;', $module->options['buttonHTML']);
        $this->assertEquals('Html source', $module->options['buttonTitle']);
        $this->assertEquals('Edit html source', $module->options['msg']);
        $this->assertEquals('Save', $module->options['okText']);
        $this->assertEquals('Cancel', $module->options['cancelText']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new HtmlEditModule(options: [
            'debug' => true,
            'buttonTitle' => 'Source HTML',
            'okText' => 'Valider',
            'cancelText' => 'Annuler',
        ]);
        $this->assertTrue($module->options['debug']);
        $this->assertEquals('Source HTML', $module->options['buttonTitle']);
        $this->assertEquals('Valider', $module->options['okText']);
        $this->assertEquals('Annuler', $module->options['cancelText']);
    }
}
