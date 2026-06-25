<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\SmartLinksModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\SmartLinksModule
 */
final class SmartLinksModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new SmartLinksModule();
        $this->assertEquals('smartLinks', $module->name);
        $this->assertEquals('/https?:\/\/[^\s]+/', $module->options['linkRegex']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new SmartLinksModule(options: [
            'linkRegex' => '/https?:\/\/[^\s]+/g',
        ]);
        $this->assertEquals('/https?:\/\/[^\s]+/g', $module->options['linkRegex']);
    }
}
