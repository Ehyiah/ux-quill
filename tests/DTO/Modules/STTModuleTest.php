<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\STTModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\STTModule
 */
final class STTModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultOptions(): void
    {
        $module = new STTModule();
        $this->assertEquals('speechToText', $module->name);
        $this->assertEquals('en-EN', $module->options['language']);
        $this->assertFalse($module->options['continuous']);
        $this->assertTrue($module->options['visualizer']);
        $this->assertEquals('#4285f4', $module->options['waveformColor']);
        $this->assertEquals('#25D366', $module->options['histogramColor']);
        $this->assertFalse($module->options['debug']);
        $this->assertEquals('Start listening', $module->options['buttonTitleStart']);
        $this->assertEquals('Stop listening', $module->options['buttonTitleStop']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomOptions(): void
    {
        $module = new STTModule(options: [
            'language' => 'fr-FR',
            'continuous' => true,
            'visualizer' => false,
            'waveformColor' => '#ff0000',
            'histogramColor' => '#00ff00',
            'debug' => true,
            'buttonTitleStart' => 'Démarrer',
            'buttonTitleStop' => 'Arrêter',
        ]);
        $this->assertEquals('fr-FR', $module->options['language']);
        $this->assertTrue($module->options['continuous']);
        $this->assertFalse($module->options['visualizer']);
        $this->assertEquals('#ff0000', $module->options['waveformColor']);
        $this->assertEquals('#00ff00', $module->options['histogramColor']);
        $this->assertTrue($module->options['debug']);
        $this->assertEquals('Démarrer', $module->options['buttonTitleStart']);
        $this->assertEquals('Arrêter', $module->options['buttonTitleStop']);
    }
}
