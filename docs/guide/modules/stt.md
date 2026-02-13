# STTModule

The Speech-to-Text module enables voice dictation using the Web Speech API. Allows users to dictate text directly into the editor with real-time audio visualization.

**Note**: The Speech-to-Text module **requires a browser that supports the Web Speech API** (Chrome, Edge, Safari). If the API is not available, the module will display a disabled state with an appropriate message.

## Options

| option name | type | description | default value | possible values |
| :---: | :---: | :--- | :---: | :---: |
| **language** | string | Speech recognition language in BCP 47 format (e.g., 'en-US', 'fr-FR', 'es-ES') | 'en-EN' | Any valid BCP 47 language code |
| **continuous** | boolean | If true, recognition automatically restarts after each pause. If false, user must manually restart | false | true, false |
| **visualizer** | boolean | Display animated audio visualizer (equalizer with 14 columns) reflecting microphone input in real-time | true | true, false |
| **waveformColor** | string | Gradient secondary color for the audio visualizer (top part of columns) | '#4285f4' | Any valid CSS color (hex, rgb, etc.) |
| **histogramColor** | string | Primary/accent color used for visualizer gradient, toolbar button when active, and listening label | '#25D366' | Any valid CSS color (hex, rgb, etc.) |
| **debug** | boolean | Enable debug mode to display recognition logs and events in browser console | false | true, false |
| **buttonTitleStart** | string | Tooltip text shown on microphone button hover when recognition is inactive | 'Start listening' | Any string |
| **buttonTitleStop** | string | Tooltip text shown on microphone button hover when recognition is active | 'Stop listening' | Any string |
| **titleInactive** | string | Label text displayed in the STT bar when recognition is inactive | 'Inactive' | Any string |
| **titleStarting** | string | Label text displayed in the STT bar when recognition is initializing | 'Starting...' | Any string |
| **titleActive** | string | Label text displayed in the STT bar during active listening | 'Listening...' | Any string |

## Usage example

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\STTModule;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        ->add('content', QuillType::class, [
            'quill_options' => [
                QuillGroup::buildWithAllFields()
            ],
            'modules' => [
                new STTModule(
                    language: 'fr-FR',           // French language recognition
                    continuous: true,             // Auto-restart after pauses
                    visualizer: true,             // Show audio visualizer
                    waveformColor: '#4285f4',     // Blue gradient color
                    histogramColor: '#25D366',    // Green accent color
                    debug: false,                 // Disable debug logs
                    buttonTitleStart: 'Start voice dictation',
                    buttonTitleStop: 'Stop voice dictation',
                    titleInactive: 'Voice recognition inactive',
                    titleStarting: 'Initializing...',
                    titleActive: 'Listening to your voice...',
                ),
            ],
        ])
    ;
}
```
