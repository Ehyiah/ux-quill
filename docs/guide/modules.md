# Modules

## PHP configurable modules

For these modules, you can configure them directly in your PHP form :
https://quilljs.com/docs/modules

You can add/customize quill modules in this option field.
You can create your own modules classes, they need to implement the ``ModuleInterface`` and add the name and options properties.
Some modules are automatically loaded when they are needed in fields.

Example of how to use modules:

```php
'modules' => [
    new SyntaxModules(),
    new TableModule(
        'menus' => ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
        'toolbarTable' => 'true', // must be set to true to show the table toolbar options in TableModule
        'language' => 'fr_FR',
    ),
],
```

| modules | auto-imported | description | name | options type | options | default options |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| **EmojiModule** | YES | required if emoji Field is activated | emoji-toolbar | string | NONE | ``'true'`` |
| **ResizeModule** | YES | used in ImageField, https://www.npmjs.com/package/quill-resize-image | resize | array | [] | [] |
| **SyntaxModule** | YES | To use with CodeBlockField field, see official [description](https://quilljs.com/docs/modules/syntax) | syntax | string | NONE | ``'true'`` |
| **HistoryModule** | NO | The History module is responsible for handling undo and redo for Quill. see details on official [site](https://quilljs.com/docs/modules/history) | history | array | ``delay``, ``maxStack``, ``userOnly`` | ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false'] |
| **SmartLinksModule** | NO | automatic recognition of links (can be customized within options) | smartLinks | array | ``linkRegex`` | ['linkRegex' => '/https?:\/\/[^\s]+/'] |
| **CounterModule** | NO | Count of number and Words inside WYSIWYG (display below WYSIWYG instance by default or inside a custom html Element if you want : specify an ID in *_container with the '#') characters counter display 1 character by default because Quill is instantiated with a <p></p> that count as 1 character | counter | array | ``words``, ``words_label``, ``words_container``, ``characters``, ``characters_label``, ``characters_container`` | ['words' => true, 'words_label' => 'Number of words : ', 'words_container' => '', 'characters' => true, 'characters_label' => 'Number of characters : ', 'characters_container' => ''] |
| **TableModule** | YES | The Table module is responsible for handling table options. see details on repository [site](https://github.com/attoae/quill-table-better) | table-better | array | https://github.com/attoae/quill-table-better | see ``Ehyiah\QuillJsBundle\DTO\Modules\TableModule`` |
| **FullScreenModule** | NO | Add a FullScreen button to the toolbar [site](https://github.com/qvarts/quill-toggle-fullscreen-button) | toggleFullscreen | array | `buttonTitle`, `buttonHTML` check https://github.com/qvarts/quill-toggle-fullscreen-button?tab=readme-ov-file#api | see ``Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule`` |
| **HtmlEditModule** | NO | The HtmlEditModule allow to edit the raw html. see details on repository [site](https://github.com/benwinding/quill-html-edit-button) | htmlEditButton | array | https://github.com/benwinding/quill-html-edit-button | see ``Ehyiah\QuillJsBundle\DTO\Modules\htmlEditButton`` | There is currently a conflict with tableField. Don't use both of them at the same time as the table inserted via the htmlEdit module will not be displayed |
| **ReadTimeModule** | NO | The ReadTimeModule add an indication on how many minutes it will take to a person to read what your write inside the WYSIWYG editor | readingTime | array | ``wpm``, ``label``, ``suffix``, ``readTimeOk``, ``readTimeMedium``, ``target`` | ['wpm' => '200', 'label' => 'Reading time: ', 'suffix' => ' min read', 'readTimeOk' => '2', 'readTimeMedium' => '5'] |
| **STTModule** | NO | The Speech-to-Text module enables voice dictation using the Web Speech API. Allows users to dictate text directly into the editor with real-time audio visualization | speechToText | array | ``language``, ``continuous``, ``visualizer``, ``waveformColor``, ``histogramColor``, ``debug``, ``buttonTitleStart``, ``buttonTitleStop``, ``titleInactive``, ``titleStarting``, ``titleActive`` | see ``Ehyiah\QuillJsBundle\DTO\Modules\STTModule`` |

## ReadTimeModule

This module calculates the estimated reading time based on the content of the editor.
It displays the result in the toolbar by default, or in a specific element if targeted.

**Options:**
- **wpm**: Words per minute used for calculation (default: `200`)
- **label**: Text displayed before the time (default: `'⏱ Reading time: ~ '`)
- **suffix**: Text displayed after the time (default: `' minute(s)'`)
- **readTimeOk**: Threshold in minutes for the "green" indicator (short read) (default: `5`)
- **readTimeMedium**: Threshold in minutes for the "orange" indicator (medium read) (default: `8`)
- **target**: ID selector of a DOM element to display the reading time (e.g., `'#my-counter'`). If not set, it appears in the toolbar.

**Usage example:**

```php
'modules' => [
    new ReadTimeModule([
        'wpm' => '250',
        'target' => '#reading-time-display',
    ]),
],
```

## STTModule

**Note**: The Speech-to-Text module **requires a browser that supports the Web Speech API** (Chrome, Edge, Safari). If the API is not available, the module will display a disabled state with an appropriate message.

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

#### Example of STTModule usage:

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

## Other modules

For other modules, you will need to extend Quill controller (see below) to use them as they required custom JavaScript as you cannot configure them in PHP.

| modules | description | name | options type | options | default options |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **KeyboardModule** | The Keyboard module enables custom behavior for keyboard events in particular contexts [site](https://quilljs.com/docs/modules/keyboard) | keyboard | array | [see next documentation section](#extend-quill-stimulus-controller) | - |
| **ClipboardModule** | The Clipboard handles copy, cut and paste between Quill and external applications [site](https://quilljs.com/docs/modules/clipboard) | clipboard | array | [see next documentation section](#extend-quill-stimulus-controller) | - |
