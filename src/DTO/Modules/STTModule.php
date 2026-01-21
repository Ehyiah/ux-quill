<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class STTModule implements ModuleInterface
{
    public const NAME = 'speechToText';

    public function __construct(
        public string $name = self::NAME,

        /**
         * @var array<string, string|string[]|bool>
         */
        public $options = [
            /*
             * Speech recognition language (BCP 47 format: 'fr-FR', 'en-US', etc.)
             * Determines which language the Web Speech API will recognize
             */
            'language' => 'en-EN',

            /*
             * Continuous mode: if true, recognition automatically restarts after each pause
             * If false, user must manually restart after each dictation
             */
            'continuous' => false,

            /*
             * Display the audio visualizer (animated equalizer with 14 columns)
             * The equalizer reflects the microphone audio level in real-time
             */
            'visualizer' => true,

            /*
             * Waveform color (gradient, secondary color)
             * Applied to the equalizer columns gradient (top part)
             */
            'waveformColor' => '#4285f4',

            /*
             * Histogram color (primary/accent color)
             * Used for:
             * - CSS variable (columns gradient)
             * - Toolbar button color when active
             * - Label color when listening
             */
            'histogramColor' => '#25D366',

            /*
             * Debug mode: displays logs in the console
             * Allows viewing recognized segments and potential errors
             */
            'debug' => false,

            /*
             * Button title when recognition is inactive
             * Visible on microphone button hover
             */
            'buttonTitleStart' => 'Start listening',

            /*
             * Button title when recognition is active
             * Visible on microphone button hover during listening
             */
            'buttonTitleStop' => 'Stop listening',

            /*
             * Label text displayed in the STT bar when inactive
             */
            'titleInactive' => 'Inactive',

            /*
             * Label text displayed in the STT bar during listening
             */
            'titleActive' => 'Listening...',

            /*
             * Label text displayed in the STT bar during voice recognition initialising
             */
            'titleStarting' => 'Starting...',
        ],
    ) {
    }
}
