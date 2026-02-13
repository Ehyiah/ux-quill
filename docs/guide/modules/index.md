# Modules

**Modules** are functional extensions that enhance the capabilities of the Quill editor beyond simple text formatting. 
They allow you to add interactive features, modify event handling, or integrate external tools.

- **Goal**: To provide business logic or complex functionality (e.g., resizing images, counting words, voice dictation, managing undo history).
- **How it works**: A module is loaded when the editor starts. It can interact with the Quill API, listen to events (keystrokes, selection changes), 
- manipulate the editor's DOM, or add interface elements.

> **Note**: This bundle provides several **custom modules** that do not exist natively in QuillJS 
> (like `ReadTimeModule`, `STTModule`, `FullScreenModule`, etc.), offering advanced features out of the box.

---

- You can add/customize quill modules in this option field.
- You can create your own modules classes, they need to implement the ``ModuleInterface`` and add the name and options properties.
- Some modules are automatically loaded when they are needed in fields.

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

|       modules        | auto-imported | description                                                                                                                                                                                                                                                                                           | name | options type | options | default options |
|:--------------------:|:-------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :---: | :---: | :---: | :---: |
|   **EmojiModule**    |      YES      | required if emoji Field is activated                                                                                                                                                                                                                                                                  | emoji-toolbar | string | NONE | ``'true'`` |
|   **ResizeModule**   |      YES      | used in ImageField, https://www.npmjs.com/package/quill-resize-image                                                                                                                                                                                                                                  | resize | array | [] | [] |
|   **SyntaxModule**   |      YES      | To use with CodeBlockField field, see official [description](https://quilljs.com/docs/modules/syntax)                                                                                                                                                                                                 | syntax | string | NONE | ``'true'`` |
|  **HistoryModule**   |      NO       | The History module is responsible for handling undo and redo for Quill. see details on official [site](https://quilljs.com/docs/modules/history)                                                                                                                                                      | history | array | ``delay``, ``maxStack``, ``userOnly`` | ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false'] |
| **SmartLinksModule** |      NO       | automatic recognition of links (can be customized within options)                                                                                                                                                                                                                                     | smartLinks | array | ``linkRegex`` | ['linkRegex' => '/https?:\/\/[^\s]+/'] |
|  **CounterModule**   |      NO       | Count of number and Words inside WYSIWYG (display below WYSIWYG instance by default or inside a custom html Element if you want : specify an ID in *_container with the '#') characters counter display 1 character by default because Quill is instantiated with a <p></p> that count as 1 character | counter | array | ``words``, ``words_label``, ``words_container``, ``characters``, ``characters_label``, ``characters_container`` | ['words' => true, 'words_label' => 'Number of words : ', 'words_container' => '', 'characters' => true, 'characters_label' => 'Number of characters : ', 'characters_container' => ''] |
|   **TableModule**    |      YES      | The Table module is responsible for handling table options. see details on repository [site](https://github.com/attoae/quill-table-better)                                                                                                                                                            | table-better | array | https://github.com/attoae/quill-table-better | see ``Ehyiah\QuillJsBundle\DTO\Modules\TableModule`` |
| **FullScreenModule** |      NO       | Add a FullScreen button to the toolbar [site](https://github.com/qvarts/quill-toggle-fullscreen-button)                                                                                                                                                                                               | toggleFullscreen | array | `buttonTitle`, `buttonHTML` check https://github.com/qvarts/quill-toggle-fullscreen-button?tab=readme-ov-file#api | see ``Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule`` |
|  **HtmlEditModule**  |      NO       | The HtmlEditModule allow to edit the raw html. see details on repository [site](https://github.com/benwinding/quill-html-edit-button)                                                                                                                                                                 | htmlEditButton | array | https://github.com/benwinding/quill-html-edit-button | see ``Ehyiah\QuillJsBundle\DTO\Modules\htmlEditButton`` | There is currently a conflict with tableField. Don't use both of them at the same time as the table inserted via the htmlEdit module will not be displayed |
|  **ReadTimeModule**  |      NO       | The ReadTimeModule add an indication on how many minutes it will take to a person to read what your write inside the WYSIWYG editor                                                                                                                                                                   | readingTime | array | ``wpm``, ``label``, ``suffix``, ``readTimeOk``, ``readTimeMedium``, ``target`` | ['wpm' => '200', 'label' => 'Reading time: ', 'suffix' => ' min read', 'readTimeOk' => '2', 'readTimeMedium' => '5'] |
|    **STTModule**     |      NO       | The Speech-to-Text module enables voice dictation using the Web Speech API. Allows users to dictate text directly into the editor with real-time audio visualization                                                                                                                                  | speechToText | array | ``language``, ``continuous``, ``visualizer``, ``waveformColor``, ``histogramColor``, ``debug``, ``buttonTitleStart``, ``buttonTitleStop``, ``titleInactive``, ``titleStarting``, ``titleActive`` | see ``Ehyiah\QuillJsBundle\DTO\Modules\STTModule`` |
