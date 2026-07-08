<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\ReadTimeModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\ReadTimeModule
 */
final class ReadTimeModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new ReadTimeModule();
        $this->assertEquals('readingTime', $module->name);
        $this->assertEquals('200', $module->options['wpm']);
        $this->assertEquals('⏱ Reading time: ~ ', $module->options['label']);
        $this->assertEquals(' minute(s)', $module->options['suffix']);
        $this->assertEquals('5', $module->options['readTimeOk']);
        $this->assertEquals('8', $module->options['readTimeMedium']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new ReadTimeModule(options: [
            'wpm' => '300',
            'label' => '⏱ Temps de lecture : ~ ',
            'suffix' => ' minute(s)',
            'readTimeOk' => '3',
            'readTimeMedium' => '6',
        ]);
        $this->assertEquals('300', $module->options['wpm']);
        $this->assertEquals('⏱ Temps de lecture : ~ ', $module->options['label']);
        $this->assertEquals('3', $module->options['readTimeOk']);
        $this->assertEquals('6', $module->options['readTimeMedium']);
    }
}
