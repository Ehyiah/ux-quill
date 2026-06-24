<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule
 */
final class SyntaxModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new SyntaxModule();
        $this->assertEquals('syntax', $module->name);
        $this->assertEquals('true', $module->options);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomName(): void
    {
        $module = new SyntaxModule('custom-syntax');
        $this->assertEquals('custom-syntax', $module->name);
    }
}
