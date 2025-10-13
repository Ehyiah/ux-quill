<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

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
            'debug' => false,
            'buttonTitleStart' => 'Start listening',
            'buttonTitleStop' => 'Stop listening',
            'titleInactive' => 'Inactive',
            'titleActive' => 'Listening...',
        ],
    ) {
    }
}
