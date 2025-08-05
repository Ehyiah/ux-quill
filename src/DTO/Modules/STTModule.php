<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

/**
 * For more options see https://github.com/tac0dev/quill-stt
 */
final class STTModule implements ModuleInterface
{
    public const NAME = 'speechToText';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public $options = [
            'language' => 'fr-FR',
            'continuous' => false,
            'visualizer' => true,
            'waveformColor' => '#4285f4',
            'histogramColor' => '#25D366',
        ],
    ) {
    }
}
