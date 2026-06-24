<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\CounterModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\CounterModule
 */
final class CounterModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new CounterModule();
        $this->assertEquals('counter', $module->name);
        $this->assertTrue($module->options['words']);
        $this->assertEquals('Number of words : ', $module->options['words_label']);
        $this->assertTrue($module->options['characters']);
        $this->assertEquals('Number of characters : ', $module->options['characters_label']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new CounterModule(options: [
            'words' => false,
            'words_label' => 'Mots : ',
            'characters_label' => 'Caractères : ',
        ]);
        $this->assertFalse($module->options['words']);
        $this->assertEquals('Mots : ', $module->options['words_label']);
        $this->assertEquals('Caractères : ', $module->options['characters_label']);
    }
}
