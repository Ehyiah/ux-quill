<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule
 */
final class AiAssistantModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new AiAssistantModule();
        $this->assertEquals('aiAssistant', $module->name);
        $this->assertEquals([], $module->options['features']);
        $this->assertEquals(['fr', 'en', 'es', 'de', 'it', 'pt'], $module->options['translate']['target_languages']);
        $this->assertEquals(3, $module->options['toc']['depth']);
        $this->assertEquals(5, $module->options['synonym']['count']);
        $this->assertEquals(['key' => 'Space', 'ctrlKey' => true, 'shiftKey' => false, 'altKey' => false, 'metaKey' => false], $module->options['keyboardShortcut']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new AiAssistantModule(options: [
            'features' => ['rewrite', 'translate'],
            'translate' => [
                'target_languages' => ['fr', 'en', 'de'],
                'default_language' => 'de',
            ],
            'toc' => [
                'depth' => 2,
            ],
            'synonym' => [
                'count' => 10,
            ],
        ]);
        $this->assertEquals(['rewrite', 'translate'], $module->options['features']);
        $this->assertEquals(['fr', 'en', 'de'], $module->options['translate']['target_languages']);
        $this->assertEquals('de', $module->options['translate']['default_language']);
        $this->assertEquals(2, $module->options['toc']['depth']);
        $this->assertEquals(10, $module->options['synonym']['count']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomKeyboardShortcut(): void
    {
        $module = new AiAssistantModule(options: [
            'keyboardShortcut' => [
                'key' => 'a',
                'ctrlKey' => true,
                'shiftKey' => true,
            ],
        ]);
        $this->assertEquals(['key' => 'a', 'ctrlKey' => true, 'shiftKey' => true, 'altKey' => false, 'metaKey' => false], $module->options['keyboardShortcut']);
    }

    /**
     * @covers ::__construct
     */
    public function testDisabledKeyboardShortcut(): void
    {
        $module = new AiAssistantModule(options: [
            'keyboardShortcut' => false,
        ]);
        $this->assertFalse($module->options['keyboardShortcut']);
    }

    /**
     * @covers ::__construct
     */
    public function testInvalidKeyboardShortcutThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('keyboardShortcut must contain a non-empty string "key"');

        new AiAssistantModule(options: [
            'keyboardShortcut' => ['ctrlKey' => true],
        ]);
    }
}
