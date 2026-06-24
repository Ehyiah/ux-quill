<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\InlineToolbarModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\InlineToolbarModule
 */
final class InlineToolbarModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new InlineToolbarModule();
        $this->assertEquals('inlineToolbar', $module->name);
        $this->assertEquals(['bold', 'italic', 'underline', 'strike'], $module->options['buttons']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomButtons(): void
    {
        $module = new InlineToolbarModule(options: [
            'buttons' => ['bold', 'italic'],
        ]);
        $this->assertEquals(['bold', 'italic'], $module->options['buttons']);
    }
}
