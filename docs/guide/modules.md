# Modules

## PHP configurable modules

For these modules, you can configure them directly in your PHP form :
https://quilljs.com/docs/modules

You can add/customize quill modules in this option field.
You can create your own modules classes, they need to implement the ``ModuleInterface`` and add the name and options properties.
Some modules are automatically loaded when they are needed in fields by implementing the `QuillFieldModuleInterface` (see [Custom Fields](/guide/advanced/custom-fields)).

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
| **ImageSelectionModule** | YES | Automatically active with ImageField. Adds a selection overlay with resize handles, alignment toolbar and paragraph insertion buttons. | imageSelection | array | ``borderColor``, ``borderWidth``, ``buttonBeforeLabel``, ``buttonAfterLabel``, ``buttonBeforeTitle``, ``buttonAfterTitle`` | ['borderColor' => '#007bff', 'borderWidth' => '4px', 'buttonBeforeLabel' => '¶+', 'buttonAfterLabel' => '+¶', 'buttonBeforeTitle' => 'Insert a paragraph before', 'buttonAfterTitle' => 'Insert a paragraph after'] |
| **SyntaxModule** | YES | To use with CodeBlockField field, see official [description](https://quilljs.com/docs/modules/syntax) | syntax | string | NONE | ``'true'`` |
| **HistoryModule** | NO | The History module is responsible for handling undo and redo for Quill. see details on official [site](https://quilljs.com/docs/modules/history) | history | array | ``delay``, ``maxStack``, ``userOnly`` | ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false'] |
| **SmartLinksModule** | NO | automatic recognition of links (can be customized within options) | smartLinks | array | ``linkRegex`` | ['linkRegex' => '/https?:\/\/[^\s]+/'] |
| **CounterModule** | NO | Count of number and Words inside WYSIWYG (display below WYSIWYG instance by default or inside a custom html Element if you want : specify an ID in *_container with the '#') characters counter display 1 character by default because Quill is instantiated with a <p></p> that count as 1 character | counter | array | ``words``, ``words_label``, ``words_container``, ``characters``, ``characters_label``, ``characters_container`` | ['words' => true, 'words_label' => 'Number of words : ', 'words_container' => '', 'characters' => true, 'characters_label' => 'Number of characters : ', 'characters_container' => ''] |
| **TableModule** | YES | The Table module is responsible for handling table options. see details on repository [site](https://github.com/attoae/quill-table-better) | table-better | array | https://github.com/attoae/quill-table-better | see ``Ehyiah\QuillJsBundle\DTO\Modules\TableModule`` |
| **ImageGalleryModule** | YES | An image gallery to allow to pick images from a gallery. Can be used with `ImageGalleryField` (Note: not included in `buildWithAllFields()`). | imageGallery | array | `listEndpoint`, `uploadEndpoint`, `searchEndpoint`, `icon`, `buttonTitle`, `uploadTitle` | see ``Ehyiah\QuillJsBundle\DTO\Modules\ImageGalleryModule`` |
| **NodeMoverModule** | YES | Enable moving any block element (text, images, videos) with a toolbar and drag handle. | nodeMover | array | [] | [] |
| **DividerModule** | YES | Add a horizontal separator (`<hr>`) support and toolbar button | divider | array | [] | [] |
| **PageBreakModule** | YES | Add a page break support for print (`page-break-after: always`) | pageBreak | array | `label` | ['label' => 'Page Break'] |
| **MentionModule** | NO | Add support for mentions (`@user`, `#tag`) with static or remote data. | mention | array | `trigger`, `data`, `remote_url`, `min_chars`, `max_results` | see documentation |
| **AutosaveModule** | NO | Automatically saves content to `localStorage` to prevent data loss. | autosave | array | `interval`, `restore_type`, `key_suffix` | see documentation |
| **PasteSanitizerModule** | NO | Clean or strip HTML when pasting content from external sources. | pasteSanitizer | array | `plain_text`, `remove_styles`, `remove_classes` | see documentation |
| **MarkdownModule** | NO | Enable Markdown-like shortcuts during typing (e.g. `# ` for H1, `* ` for list) | markdown | array | [] | [] |
| **DragAndDropModule** | YES | Enable internal drag and drop of elements like images and videos inside the editor. | dragAndDrop | array | [] | [] |
| **LinkAttributesModule** | YES | Add support for `target` and `rel` attributes on links. | linkAttributes | array | [] | [] |
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

## MarkdownModule

This module enables Markdown shortcuts directly in the editor while typing. When you type a specific sequence followed by a space or enter, it will automatically format the current line.

**Available shortcuts:**
- `# ` to `###### `: Creates headers (H1 to H6).
- `* ` or `- `: Creates a bulleted list.
- `1. `: Creates an ordered list.
- `> `: Creates a blockquote.

**Usage example:**

```php
'modules' => [
    new MarkdownModule(),
],
```

## PageBreakModule

This module adds support for page breaks. It displays a visual indicator in the editor and applies a `page-break-after: always` rule when printing.

**Options:**
- **label**: The text displayed on the page break line (default: `'Page Break'`)

**Usage example:**

```php
'modules' => [
    new PageBreakModule([
        'label' => 'Saut de page',
    ]),
],
```

## MentionModule

This module allows you to trigger suggestions when typing a specific character (like `@` or `#`). It supports both static data and remote data fetching via AJAX.

### Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **trigger** | `string` | The character that triggers the suggestion list. | `'@'` |
| **data** | `array` | A static list of items. Each item must be an object: `{'id': 1, 'value': 'Name'}`. | `[]` |
| **remote_url** | `string` | URL for AJAX search. Use `{query}` as a placeholder for the user input. | `null` |
| **min_chars** | `int` | Minimum characters to type after the trigger before showing suggestions. | `0` |
| **max_results** | `int` | Maximum number of results displayed in the suggestion list. | `10` |

### Behavior

- **Triggering**: The list appears when the `trigger` character is followed by at least `min_chars` characters (without spaces).
- **Navigation**:
    - `ArrowUp` / `ArrowDown`: Move selection in the list.
    - `Enter` / `Tab`: Select the current item.
    - `Escape`: Close the suggestion list.
- **Insertion**: When selected, the trigger and the typed query are replaced by a **Mention Blot** (a styled `<span>`).

### Remote Search (AJAX)

When using `remote_url`, your API must return a JSON array of objects with at least `id` and `value` properties:

```json
[
  { "id": "user-1", "value": "John Doe" },
  { "id": "user-2", "value": "Jane Smith" }
]
```

Example URL configuration: `https://api.example.com/users?search={query}`

### Usage Examples

**1. Basic usage with static data:**

```php
'modules' => [
    new MentionModule(options: [
        'trigger' => '@',
        'data' => [
            ['id' => 1, 'value' => 'Matthieu'],
            ['id' => 2, 'value' => 'Gemini'],
            ['id' => 3, 'value' => 'Symfony'],
        ],
    ]),
],
```

**2. Advanced usage with remote search (e.g., Tags):**

```php
'modules' => [
    new MentionModule(options: [
        'trigger' => '#',
        'remote_url' => '/api/tags/search?q={query}',
        'min_chars' => 2,
        'max_results' => 5,
    ]),
],
```

**3. Multiple triggers:**

If you need multiple triggers (e.g., `@` for users AND `#` for tags), you can pass multiple instances. **Make sure each one has a unique `name` starting with `mention-`**:

```php
'modules' => [
    new MentionModule(name: 'mention-users', options: [
        'trigger' => '@',
        'remote_url' => '/api/users/search?q={query}',
    ]),
    new MentionModule(name: 'mention-tags', options: [
        'trigger' => '#',
        'data' => [
            ['id' => 'tech', 'value' => 'technology'],
            ['id' => 'news', 'value' => 'news'],
        ],
    ]),
],
```

### Customizing the look

The mentions and the suggestion list can be styled using CSS. Here are the default classes:
- `.ql-mention`: The inserted mention in the editor.
- `.ql-mention-list`: The floating suggestion container.
- `.ql-mention-item`: An item in the list.
- `.ql-mention-item.selected`: The currently highlighted item.

Example to customize the mention color:
```css
.ql-editor .ql-mention {
    background-color: #fce4ec;
    color: #c2185b;
}
```

## AutosaveModule

This module prevents data loss by automatically saving the editor content to the browser's `localStorage`.

**Options:**
- **interval**: Time in milliseconds between saves (debounce). Default: `2000` (2 seconds).
- **restore_type**: How to restore data.
    - `'manual'` (default): Show a notification bar allowing the user to choose to restore or ignore.
    - `'auto'`: Automatically restore the content if the editor is empty.
- **key_suffix**: Optional string to append to the storage key to avoid collisions.

**Behavior:**
- **Saving**: Content is saved automatically after the user stops typing for the specified interval.
- **Restoration**: On page load, if a saved version is found and differs from the current content, the module acts according to `restore_type`.
- **Cleanup**: The saved data is automatically cleared when the parent `<form>` is submitted.

**Usage example:**

```php
'modules' => [
    new AutosaveModule(options: [
        'interval' => 3000,
        'restore_type' => 'manual',
    ]),
],
```

## PasteSanitizerModule

This module helps maintain a clean editor by forcing pasted content from external sources to plain text.

**Options:**
- **plain_text**: If `true`, all formatting is removed and only plain text is pasted. Default: `true`.

**Usage example:**

```php
'modules' => [
    new PasteSanitizerModule(options: [
        'plain_text' => true,
    ]),
],
```

## LinkAttributesModule

This module is **automatically enabled** when using the `LinkField`. It allows users to edit advanced link attributes like `target="_blank"` and `rel="nofollow"` via a dedicated user interface.

**How it works:**
1. Click on any link in the editor.
2. A "pencil" icon appears above the link.
3. Click the icon to open a floating form where you can set the "Open in new tab" and "No follow" options.
4. Changes are applied in real-time.

**Note:** This module ensures that `target` and `rel` attributes are preserved when loading content or pasting links.

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
