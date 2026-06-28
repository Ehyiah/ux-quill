<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule;
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
        ]);
        $this->assertEquals(['rewrite', 'translate'], $module->options['features']);
        $this->assertEquals(['fr', 'en', 'de'], $module->options['translate']['target_languages']);
        $this->assertEquals('de', $module->options['translate']['default_language']);
        $this->assertEquals(2, $module->options['toc']['depth']);
    }
}
