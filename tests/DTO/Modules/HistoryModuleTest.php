<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\HistoryModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\HistoryModule
 */
final class HistoryModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new HistoryModule();
        $this->assertEquals('history', $module->name);
        $this->assertEquals('1000', $module->options['delay']);
        $this->assertEquals('100', $module->options['maxStack']);
        $this->assertEquals('false', $module->options['userOnly']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new HistoryModule(options: [
            'delay' => '2000',
            'maxStack' => '50',
            'userOnly' => 'true',
        ]);
        $this->assertEquals('2000', $module->options['delay']);
        $this->assertEquals('50', $module->options['maxStack']);
        $this->assertEquals('true', $module->options['userOnly']);
    }
}
