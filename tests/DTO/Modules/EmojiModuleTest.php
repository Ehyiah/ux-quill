<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule
 */
final class EmojiModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new EmojiModule();
        $this->assertEquals('emoji-toolbar', $module->name);
        $this->assertEquals('true', $module->options);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new EmojiModule(options: 'false');
        $this->assertEquals('false', $module->options);
    }
}
