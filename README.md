# QuillJs Bundle for Symfony using Symfony UX

<div align="center">
  <img src="./quill_logo.png" alt="Melody logo" width="400"/>
</div>


Symfony UX Bundle implementing the Quill JS Wysiwyg https://quilljs.com/

If you need an easy-to-use WYSIWYG (with no complex configuration) into a symfony project, this is what you need.

It comes with some extra features out of the box like image uploading to custom endpoint instead of base64 only.

* [Installation](#installation)


* [Basic Usage](#basic-usage)
* [Display Result](#display-result)


* [Customize quillJS with options and extra_options](#customize-options)

* [Handle images uploads](#image-upload-handling)
* [Handle images uploads security](#upload-endpoint-security)

* [Customize toolbar icons](#icons)

* [Extend Quill stimulus controller](#extend-quill-stimulus-controller)


* [EasyAdmin Integration](#easyadmin-integration)
* [EasyAdmin Usage](#EasyAdmin-Field-usage)

## Installation
### Step 1 Require bundle
```sh
  composer require ehyiah/ux-quill
```
If you are using the AssetMapper Component you're done !

### step 2 next run (If you are using webpack encore, not needed with AssetMapper)
``` sh
    yarn install --force
    yarn watch
```
OR
``` sh
    npm install --force
    npm run watch
``` 
It's done, you can use the QuillType to build a QuillJs WYSIWYG

You can add as many WYSIWYG fields inside same page like any normal fields.

# Basic Usage
In a form, use QuillType. It works like a classic Type except it has more options : e.g:
```php
    use Ehyiah\QuillJsBundle\Form\QuillType;
    
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            // ...
            ->add('myField', QuillType::class)
        ;
    }
```

# Display result
in a twig template :

- if you use the default class styling option you may need to encapsulate the content so the quill stylesheet can be applied like this :
```
    <div class="ql-snow">
        <div class="ql-editor">
            {{ myField|raw }}
        </div>
    </div>
```

- if you use the inline styling option simply :
```
    <div>{{ myField|raw }}</div>
```


For the most basic this is only what you have to do.
# Customize Options
```php
    use Ehyiah\QuillJsBundle\Form\QuillType;
    
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            // ...
            ->add('myField', QuillType::class, [
                'quill_extra_options' => [
                    'height' => '780px',
                    'theme' => 'snow',
                    'placeholder' => 'Hello Quill WYSIWYG',
                ],
                'quill_options' => [
                // this is where you customize the WYSIWYG by creating one or many Groups
                // if you create many groups, they will be separated by a space in the toolbar
                // you can also build your groups using a classic array but many classes are covering every Quill available Fields (see below for detailed list)
                    QuillGroup::build(
                        new BoldField(),
                        new ItalicField(),
                        // and many more
                    ),
                    QuillGroup::build(
                        new HeaderField(HeaderField::HEADER_OPTION_1),
                        new HeaderField(HeaderField::HEADER_OPTION_2),
                        // and many more
                    ),
                    // Or add all built-in available fields at once
                    QuillGroup::buildWithAllFields()
                ]
            ])
        ;
    }
```


## quill_options :
This is where you will choose what elements you want to display in your WYSIWYG.
You can build an array like you would do following the QuillJs official documentation
Or use a more convenient with Autocomplete using the many Fields Object in this bundle.
```
      QuillGroup::build(
          new HeaderField(HeaderField::HEADER_OPTION_1),
          new HeaderField(HeaderField::HEADER_OPTION_2),
      )
```
This example will display a h1 and h2 header options side by side
```
      QuillGroup::build(
          new HeaderField(HeaderField::HEADER_OPTION_1),
          new HeaderField(HeaderField::HEADER_OPTION_2),
      )
      QuillGroup::build(
          new BoldField(),
          new ItalicField(),
      )
```
This example will display a h1 and h2 header options side by side and another Group containing a Bold and an Italic fields

You can add as many Groups as you like or just One if you don't need the WYSIWYG options to have spaces between them.

### Available Fields 
- Below is the list of available fields from QuillJS (https://v2.quilljs.com/docs/formats)

|        Field         |                                     Description                                      |   Available options    (options are available as class constants in each Field Class)    | Default option | QuillJS field name |
|:--------------------:|:------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------:|:--------------:|:------------------:|
|      BoldField       |                                  mark text as bold                                   |                                            -                                             |                |        bold        |
|      ColorField      |                               Change color of the font                               |           array of colors (default is empty array to get quillJS default value           |                |       color        |
| BackGroundColorField |                     change background color of the selected text                     |           array of colors (default is empty array to get quillJS default value           |                |     background     |
|      AlignField      |                                Choose text alignment                                 |                           false (left), center, right, justify                           |      all       |       align        |
|    DirectionField    |                                Choose text direction                                 | rtl (right to left, this is the only option available this widget is more like a toggle) |      rtl       |     direction      |
|      FontField       |                                    Choose a font                                     |                             ''(sans serif) ,serif, monospace                             |      all       |        font        |
|   HeaderGroupField   |                           Display a list of header levels                            |                    1, 2, 3, 4, 5, 6, false (will only display normal)                    |      all       |       header       |
|     HeaderField      |                              Add a H1 or H2 widget only                              |                                           1, 2                                           |       1        |       header       |
|     IndentField      |                                 Add or Remove indent                                 |                                          +1, -1                                          |       +1       |       indent       |
|      ListField       |                                      Add a list                                      |                                  ordered, bullet, check                                  |    ordered     |        list        |
|     ScriptField      |                                                                                      |                                        sub, super                                        |      sub       |       script       |
|      SizeField       |                                   Change text size                                   |                            small, false (normal), large, huge                            |      all       |        size        |
|   BlockQuoteField    |                                     Quote a text                                     |                                            -                                             |                |     blockquote     |
|      CleanField      |                                  Clean text styling                                  |                                            -                                             |                |       clean        |
|    CodeBlockField    |                                   Add a code-block                                   |                                            -                                             |                |     code-block     |
|      CodeField       |                                    Add some code                                     |                                            -                                             |                |        code        |
|     FormulaField     |                   add a formula (with [Katex](https://katex.org/))                   |                                            -                                             |                |      formula       |
|      ImageField      | Add an image (see [quill_extra_options](#image-upload-handling) for uploads options) |                                            -                                             |                |       image        |
|     ItalicField      |                                 mark text as italic                                  |                                            -                                             |                |       italic       |
|      LinkField       |                                 Add a link to a text                                 |                                            -                                             |                |        link        |
|     StrikeField      |                                mark a text as striked                                |                                            -                                             |                |       strike       |
|    UnderlineField    |                               mark text as underlined                                |                                            -                                             |                |     underline      |
|      VideoField      |                                  add an embed video                                  |                                            -                                             |                |       video        |


- Below is a list of fields not available in QuillJS but taken from community:

|   Field    |    Description     | Available options  (options are available as class constants in each Field Class)  | Default option |
|:----------:|:------------------:|:----------------------------------------------------------------------------------:|:--------------:|
| EmojiField |    Add an emoji    |                                         -                                          |                |
| TableField | add a table field  |                                         -                                          |                |



## quill_extra_options
|   extra_option_name   |             type              | details                                                                                                                                  |
|:---------------------:|:-----------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------|
|       **debug**       |            string             | `` error``, ``warn``, ``log``, ``info``  (you can use ``DebugOption`` class constants to pick a value)                                   |
|      **height**       |            string             | examples: ``200px``, ``200em``, default: '200px'                                                                                         |
|       **theme**       |            string             | ``snow``, ``bubble`` , default: snow (you can use ``ThemeOption`` class constants to pick a value)                                       |
|    **placeholder**    | string or TranslatableMessage |                                                                                                                                          |                                                                                                                                          |
|       **style**       |            string             | ``class``, ``inline``, choose how the style will be applied.                                                                             |
|  **upload_handler**   |             array             | (explained [below](#image-upload-handling) (you can use ``UploadHandlerOption`` class constants to pick a value)                         |
| **use_semantic_html** |             bool              | will use the ``getSemanticHTML()`` instead of ``innerHTML`` _(can resolve some problems like https://github.com/slab/quill/issues/3957)_ |
|   **custom_icons**    |             array             | customize icons by passing a SVG to replace the default quill icon (explained [below](#icons)                                            |
|     **read_only**     |             bool              | to display quill in readOnly mode                                                                                                        |
|      **assets**       |             array             | if you need to add custom assets _(stylesheets or scripts via a CDN address)_ [assets exemple](#assets-example)                          |

#### assets example
```php
    'quill_extra_options' => [
       'assets' => [
           'styleSheets' => [
               "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
               "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css",
           ],
           'scripts' => [
               "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js",
               "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
           ]
       ],
    ]
```

OR associative array, this will allow you to **override** default built-in CDN assets for katex _(use for FormulaField)_ and highlight _(use for CodeBlockField)_

```php
    'quill_extra_options' => [
        'assets' => [
            'styleSheets' => [
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css'
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
            ],
            'scripts' => [
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js',
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js'
            ],
        ],
    ]
```

### Image upload Handling
In ***ImageField*** : QuillJS transforms images in a base64 encoded file by default to save your files.
However, you can specify a custom endpoint to handle image uploading and pass in response the entire public URL to display the image. 
#### currently handling 2 methods :

#### 1: data sending in ``base64`` inside a ``application/json`` request
- in JSON mode data will look like this by calling ``$request->getContent()`` and ```application/json``` in content-type headers
```
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAQAAAAUb1BXAAAABGdBTUEAALGPC/xhBQAAACyygyyioiBqFCUIKC64x..."
```
#### 2: sending in a ``multipart/form-data`` request
- in form mode you will find a ```multipart/form-data``` in content-type headers and file will be present in $request->files named ```file``` as a ``Symfony\Component\HttpFoundation\File\UploadedFile``
- then you can handle it like you would do with a FileType and access the file like this : 
```php
    /** @var \Symfony\Component\HttpFoundation\Request $request */
    /** @var \Symfony\Component\HttpFoundation\File\UploadedFile $file */
    $file = $request->files->get('file'))
```

#### upload mode configuration :
**example of a JSON configuration to send a request to the upload endpoint that returns a JSON response containing the URL to the uploaded image.**
```php
    'quill_extra_options' => [
        'upload_handler' => [
            'type' => 'json',
            'upload_endpoint' => '/my-custom-endpoint/upload',
            'json_response_file_path' => 'file.url'
        ]
    ],
```

see below for a detail on these options values.
### available options in upload handler:
| upload_handler option name  |  type  | default value | possible values                                                                                                                                                                                                                                  |
|:---------------------------:|:------:|---------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|          **type**           | string | form          | ``json``, ``form``                                                                                                                                                                                                                               |
|     **upload_endpoint**     | string | null          | the endpoint of your upload handler exemple : ``/upload`` or ``https://my-custom-upload-endpoint/upload``                                                                                                                                        |
| **json_response_file_path** | string | null          | if you specify this option, that mean your upload endpoint will return you a json response. The value must be the path inside the json (this option will be ignored if the content type of the upload endpoint response is not application/json) |
|       **security**          | array  | null          | see below for available options                                                                                                                                                                                                                  |

#### upload endpoint security:
|     security options     |  type  |    used with     | default values |            possible values             | explaination                                                                                                                                                                                                                                                                                                                              |
|:------------------------:|:------:|:----------------:|:--------------:|:--------------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|         **type**         | string |                  |      null      | ``jwt``, ``basic``, ``custom_header``  | with ``jwt`` a header will be added in the post request ``'authorization'  => 'Bearer MY_JWT_TOKEN'``, with ``basic`` a header will be added in the post request ``'authorization' => 'Basic YmFiYXI6cGFzcy1iYWJhcg=='`` with ``custom_header`` a header will be added in the post request ``'custom_header' => 'custom_header_value=='`` |
|      **jwt_token**       | string |       jwt        |      null      |                                        | pass a valid JWT token for your upload endpoint (don't specify Bearer, it will be added automatically)                                                                                                                                                                                                                                    |
|       **username**       | string |      basic       |      null      |                                        | the username of your basic http user                                                                                                                                                                                                                                                                                                      |
|       **password**       | string |      basic       |      null      |                                        | the password of your basic http user                                                                                                                                                                                                                                                                                                      |
|    **custom_header**     | string |  custom_header   |      null      |                                        | the key used for your custom header                                                                                                                                                                                                                                                                                                       |
|  **custom_header_value** | string |  custom_header   |      null      |                                        | the value that will be passed in your custom header                                                                                                                                                                                                                                                                                       |

**example of a JSON configuration with jwt security.**
```php
    'quill_extra_options' => [
        'upload_handler' => [
            'type' => 'json',
            'upload_endpoint' => '/my-custom-endpoint/upload',
            'json_response_file_path' => 'file.url',
            'security' => [
                'type' => 'jwt',
                'jwt_token' => 'my_jwt_token',
            ],
        ]
    ],
```

- If your response in a classic simple ``Symfony\Component\HttpFoundation\Response``, you can simply return a response like this one for exemple and do **not** need to specify the ``json_response_file_path`` option.
```php
        return new Response('https://my-website/public/assets/my-uploaded-image.jpg');
```
- If your response is a JSON response like a ``Symfony\Component\HttpFoundation\JsonResponse``, the ``json_response_file_path`` option can be used to specify the url inside the json response.
in the exemple below ``json_path_file_response`` must be ``'file.url'``.
```php
    return new JsonResponse([
        'file' => [
            'url' => 'https://my-website/public/assets/my-uploaded-image.jpg',
        ]
    ]);
```
- If your response is a JSON response like a ``Symfony\Component\HttpFoundation\JsonResponse``, **and** the ``json_response_file_path`` is **null**.
```php
    return new JsonResponse('https://my-website/public/assets/my-uploaded-image.jpg');
```


## Modules
### PHP configurable modules
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

|        modules         | auto-imported | description                                                                                                                                                                                                                                                                                           |       name        | options type |                                                        options                                                         |                                                                                    default options                                                                                     |
|:----------------------:|:-------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------:|:------------:|:----------------------------------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
|    **EmojiModule**     |      YES      | required if emoji Field is activated                                                                                                                                                                                                                                                                  |   emoji-toolbar   |    string    |                                                          NONE                                                          |                                                                                       ``'true'``                                                                                       |
|    **ResizeModule**    |      YES      | used in ImageField,  https://www.npmjs.com/package/quill-resize-image                                                                                                                                                                                                                                 |      resize       |    array     |                                                           []                                                           |                                                                                           []                                                                                           |
|    **SyntaxModule**    |      YES      | To use with CodeBlockField field, see official [description](https://quilljs.com/docs/modules/syntax)                                                                                                                                                                                                 |      syntax       |    string    |                                                          NONE                                                          |                                                                                       ``'true'``                                                                                       |
|   **HistoryModule**    |      NO       | The History module is responsible for handling undo and redo for Quill. see details on official [site](https://quilljs.com/docs/modules/history)                                                                                                                                                      |      history      |    array     |                                         ``delay``, ``maxStack``, ``userOnly``                                          |                                                            ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false']                                                             |
|  **SmartLinksModule**  |      NO       | automatic recognition of links (can be customized within options)                                                                                                                                                                                                                                     |    smartLinks     |    array     |                                                     ``linkRegex``                                                      |                                                                         ['linkRegex' => '/https?:\/\/[^\s]+/']                                                                         |
|   **CounterModule**    |      NO       | Count of number and Words inside WYSIWYG (display below WYSIWYG instance by default or inside a custom html Element if you want : specify an ID in *_container with the '#') characters counter display 1 character by default because Quill is instantiated with a <p></p> that count as 1 character |      counter      |    array     |    ``words``, ``words_label``, ``words_container``, ``characters``, ``characters_label``, ``characters_container``     | ['words' => true, 'words_label' => 'Number of words : ', 'words_container' => '', 'characters' => true, 'characters_label' => 'Number of characters : ', 'characters_container' => ''] |
|    **TableModule**     |      YES      | The Table module is responsible for handling table options. see details on repository [site](https://github.com/attoae/quill-table-better)                                                                                                                                                            |   table-better    |    array     |                                      https://github.com/attoae/quill-table-better                                      |                                                                    see ``Ehyiah\QuillJsBundle\DTO\Modules\TableModule``                                                                |
| **FullScreenModule**   |      NO       | Add a FullScreen button to the toolbar [site](https://github.com/qvarts/quill-toggle-fullscreen-button)                                                                                                                                                                                               |  toggleFullscreen |    array     |   `buttonTitle`, `buttonHTML`    check https://github.com/qvarts/quill-toggle-fullscreen-button?tab=readme-ov-file#api |                                                               see ``Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule``                                                                |
|  **HtmlEditModule**  |      NO       | The HtmlEditModule allow to edit the raw html. see details on repository [site](https://github.com/benwinding/quill-html-edit-button)                                                                                                                                                                 | htmlEditButton  |    array     |                              https://github.com/benwinding/quill-html-edit-button                               |                                                              see ``Ehyiah\QuillJsBundle\DTO\Modules\htmlEditButton``                                                                   | There is currently a conflict with tableField. Don't use both of them at the same time as the table inserted via the htmlEdit module will not be displayed |
| **ReadTimeModule**   |      NO       | The ReadTimeModule add an indication on how many minutes it will take to a person to read what your write inside the WYSIWYG editor                                                                                                                                                                   | readingTime  |    array     |                      ``wpm``, ``label``, ``suffix``, ``readTimeOk``, ``readTimeMedium``, ``target``                       |                                                             ['wpm' => '200', 'label' => 'Reading time: ', 'suffix' => ' min read', 'readTimeOk' => '2', 'readTimeMedium' => '5']                                                                    |
|   **STTModule**      |      NO       | The Speech-to-Text module enables voice dictation using the Web Speech API. Allows users to dictate text directly into the editor with real-time audio visualization                                                                                                                                   |   speechToText  |    array     |    ``language``, ``continuous``, ``visualizer``, ``waveformColor``, ``histogramColor``, ``debug``, ``buttonTitleStart``, ``buttonTitleStop``, ``titleInactive``, ``titleStarting``, ``titleActive``    |                                                                    see ``Ehyiah\QuillJsBundle\DTO\Modules\STTModule``                                                                    |
| **GalleryModule** |      NO       | A media gallery to allow to pick images from a media gallery   [see more details](#media-gallery-module-details)                                                                                                                                                                                      | mediaGallery  |    array     |                                       `listEndpoint`, `uploadEndpoint`, `searchEndpoint`, `icon`                                       |                               see ``Ehyiah\QuillJsBundle\DTO\Modules\GalleryModule``                                                                                                   |

#### ReadTimeModule details
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

#### STTModule detailed options:
**Note**: The Speech-to-Text module **requires a browser that supports the Web Speech API** (Chrome, Edge, Safari). If the API is not available, the module will display a disabled state with an appropriate message.

| option name          | type    | description                                                                                                       | default value      | possible values                                   |
|:--------------------:|:-------:|:------------------------------------------------------------------------------------------------------------------|:------------------:|:-------------------------------------------------:|
| **language**         | string  | Speech recognition language in BCP 47 format (e.g., 'en-US', 'fr-FR', 'es-ES')                                   | 'en-EN'            | Any valid BCP 47 language code                    |
| **continuous**       | boolean | If true, recognition automatically restarts after each pause. If false, user must manually restart               | false              | true, false                                       |
| **visualizer**       | boolean | Display animated audio visualizer (equalizer with 14 columns) reflecting microphone input in real-time           | true               | true, false                                       |
| **waveformColor**    | string  | Gradient secondary color for the audio visualizer (top part of columns)                                           | '#4285f4'          | Any valid CSS color (hex, rgb, etc.)              |
| **histogramColor**   | string  | Primary/accent color used for visualizer gradient, toolbar button when active, and listening label                | '#25D366'          | Any valid CSS color (hex, rgb, etc.)              |
| **debug**            | boolean | Enable debug mode to display recognition logs and events in browser console                                       | false              | true, false                                       |
| **buttonTitleStart** | string  | Tooltip text shown on microphone button hover when recognition is inactive                                        | 'Start listening'  | Any string                                        |
| **buttonTitleStop**  | string  | Tooltip text shown on microphone button hover when recognition is active                                          | 'Stop listening'   | Any string                                        |
| **titleInactive**    | string  | Label text displayed in the STT bar when recognition is inactive                                                  | 'Inactive'         | Any string                                        |
| **titleStarting**    | string  | Label text displayed in the STT bar when recognition is initializing                                              | 'Starting...'      | Any string                                        |
| **titleActive**      | string  | Label text displayed in the STT bar during active listening                                                       | 'Listening...'     | Any string                                        |

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


### Media gallery module details
Here is the list of some options for the media gallery module (see full available options in PHP class): 

- **listEndpoint** : the endpoint to get the list of images from. This option is mandatory
The response from your endpoint must be like this : 
```json
{
   "data": [
      {
         "url": "https://picsum.photos/id/11/400/400",
         "thumbnail": "https://picsum.photos/id/11/200/200",
         "title": "Image #1"
      }
   ],
   "links": {
      "next": "/api/media/list?page=2",
      "prev": null
   }
}
```

- **searchEndpoint** : the endpoint to search images. If no url is provided, the search bar will not be displayed.
  The search term will be passed as a query parameter named `term`.
  The response format is the same as the list endpoint.
- **icon** : the icon to use in the toolbar pass a svg icon like others icons customization.

- **uploadEndpoint**, **uploadStrategy**, **authConfig**, **jsonResponseFilePath** : 
By default, these options **automatically inherit** from the global `upload_handler` configuration defined in `quill_extra_options`.
However, you can override them specifically for the gallery module if needed.

- **uploadEndpoint** : the endpoint to upload an image. If no url is provided (globally or locally), the upload button will not be displayed.
- **uploadStrategy** : 'form' (default) or 'json'.


- example of a listing api endpoint for testing purpose
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/media/gallery', name: 'api_media_')]
class GalleryController extends AbstractController
{
    #[Route('/list', name: 'api_media_list')]
    public function list(Request $request): JsonResponse
    {
        $page = $request->get('page', 1);
        $perPage = 10;
        $total = 30;

        $images = [];
        for ($i = 0; $i < $perPage; $i++) {
            $id = (($page - 1) * $perPage) + $i + 1;
            if ($id > $total) break;
            $images[] = [
                'url' => sprintf('https://picsum.photos/id/%d/400/400', 10 + $id),
                'thumbnail' => sprintf('https://picsum.photos/id/%d/200/200', 10 + $id),
                'title' => "Image #$id",
            ];
        }

        $baseUrl = '/api/media/gallery/list';
        $hasNext = ($page * $perPage) < $total;
        $hasPrev = $page > 1;

        return new JsonResponse([
            'data' => $images,
            'links' => [
            'next' => $hasNext ? "$baseUrl?page=" . ($page + 1) : null,
            'prev' => $hasPrev ? "$baseUrl?page=" . ($page - 1) : null,
            ],
        ]);
    }

    #[Route('/search', name: 'api_media_search')]
    public function search(Request $request): JsonResponse
    {
    // This is not actually making a research, but you will see that 5 pages are available instead of 3
        $term = $request->get('term', 1);
        $page = $request->get('page', 1);
        $perPage = 10;
        $total = 50;

        $images = [];
        for ($i = 0; $i < $perPage; $i++) {
            $id = (($page - 1) * $perPage) + $i + 1;
            if ($id > $total) break;
            $images[] = [
                'url' => sprintf('https://picsum.photos/id/%d/400/400', 10 + $id),
                'thumbnail' => sprintf('https://picsum.photos/id/%d/200/200', 10 + $id),
                'title' => "Image #$id",
            ];
        }

        $baseUrl = '/api/media/gallery/search?term=' . $term;
        $hasNext = ($page * $perPage) < $total;
        $hasPrev = $page > 1;

        return new JsonResponse([
            'data' => $images,
            'links' => [
                'next' => $hasNext ? "$baseUrl&page=" . ($page + 1) : null,
                'prev' => $hasPrev ? "$baseUrl&page=" . ($page - 1) : null,
            ],
        ]);
    }
}
```

### Other modules that need custom JavaScript
For other modules, you will need to extend Quill controller (see below) to use them as they required custom JavaScript as you cannot configure them in PHP.

|       modules       | description                                                                                                                               |     name      | options type |                               options                               |                         default options                         |
|:-------------------:|:------------------------------------------------------------------------------------------------------------------------------------------|:-------------:|:------------:|:-------------------------------------------------------------------:|:---------------------------------------------------------------:|
| **KeyboardModule**  | The Keyboard module enables custom behavior for keyboard events in particular contexts [site](https://quilljs.com/docs/modules/keyboard)  |   keyboard    |    array     | [see next documentation section](#extend-quill-stimulus-controller) |                                -                                |
| **ClipboardModule** | The Clipboard handles copy, cut and paste between Quill and external applications [site](https://quilljs.com/docs/modules/clipboard)      |   clipboard   |    array     | [see next documentation section](#extend-quill-stimulus-controller) |                                -                                |

## icons
You can customize icons used in the toolbar, pass the toolbar name and a new svg
exemple :
```php
    'quill_extra_options' => [
        /// other extra options
        'custom_icons' => [
            'bold' => '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#2488FF;" d="M478.609,300.522v-33.39h-33.391v-66.784h33.391l0,0l0,0V66.783h-33.391v-33.39h-33.391V0H0v100.174 h33.39v311.652H0V512h445.217v-33.39h33.391v-0.001l0,0v-33.391l0,0l0,0H512V300.522H478.609z M345.043,378.435H166.957v-44.522 h178.087V378.435z M345.043,155.826H166.957v-33.391h178.087V155.826z"></path> <polygon style="fill:#005ECE;" points="478.609,300.522 478.609,267.132 445.217,267.132 445.217,200.348 478.609,200.348 478.609,200.348 478.609,200.348 478.609,66.783 445.217,66.783 445.217,33.392 411.826,33.392 411.826,0 256,0 256,122.435 345.043,122.435 345.043,155.826 256,155.826 256,333.913 345.043,333.913 345.043,378.435 256,378.435 256,512 445.217,512 445.217,478.61 478.609,478.61 478.609,478.609 478.609,478.609 478.609,445.217 478.609,445.217 478.609,445.217 512,445.217 512,300.522 "></polygon> <rect x="33.391" y="100.174" width="33.391" height="311.652"></rect> <polygon points="33.391,411.826 0,411.826 0,512 445.217,512 445.217,478.609 33.391,478.609 "></polygon> <polygon points="411.826,33.391 411.826,0 0,0 0,100.174 33.391,100.174 33.391,33.391 "></polygon> <rect x="411.826" y="33.391" width="33.391" height="33.391"></rect> <rect x="445.217" y="66.783" width="33.391" height="133.565"></rect> <rect x="478.609" y="300.522" width="33.391" height="144.696"></rect> <rect x="445.217" y="445.217" width="33.391" height="33.391"></rect> <polygon points="378.435,189.217 378.435,122.435 345.043,122.435 345.043,155.826 166.957,155.826 166.957,122.435 345.043,122.435 345.043,89.043 133.565,89.043 133.565,189.217 "></polygon> <polygon points="345.043,378.435 166.957,378.435 166.957,333.913 345.043,333.913 345.043,300.522 133.565,300.522 133.565,411.826 378.435,411.826 378.435,333.913 345.043,333.913 "></polygon> <polygon points="411.826,233.739 378.435,233.739 378.435,267.13 445.217,267.13 445.217,200.348 411.826,200.348 "></polygon> <rect x="445.217" y="267.13" width="33.391" height="33.391"></rect> </g></svg>',
            'italic' => '<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z"></path> <path d="M272.562,361.891L271.016,368H192l1.984-6.109c7.922-0.219,13.172-1,15.719-2.312c4.141-1.875,7.219-4.469,9.203-7.766 c3.109-5.172,6.312-14.422,9.625-27.75l33.406-135.125c2.844-11.25,4.25-19.719,4.25-25.438c0-2.875-0.625-5.297-1.828-7.281 c-1.234-1.969-3.094-3.5-5.594-4.531c-2.516-1.062-7.391-1.578-14.672-1.578l1.719-6.109H320l-1.562,6.109 c-6.031-0.109-10.516,0.672-13.453,2.312c-4.234,2.203-7.484,5.344-9.688,9.422c-2.234,4.062-5.078,13.094-8.578,27.094 l-33.266,135.125c-3.016,12.438-4.531,20.375-4.531,23.781c0,2.75,0.578,5.094,1.766,7.031c1.188,1.922,3.078,3.406,5.656,4.453 C258.938,360.375,264.359,361.234,272.562,361.891z"></path> </g></svg>',
        ]
    ],
```

# Extend Quill stimulus controller
If you need to extend the default behavior of the built-in controller, this is possible.
For example, you need to modify module registration and/or add custom JavaScript to modify quill behavior.

Some modules like ``Keyboard`` and ``Clipboard`` need custom JavaScript to be written.
The easiest way to do so is to create a custom stimulus controller to extend the default behavior.

You can do this easily by attaching to various events to avoid being forced to rewrite the entire controller.

### Events
Some events are dispatched by the controller or its modules. **All events are prefixed** with `quill:`.
Since they all bubble, you can catch them on the element carrying the controller using `data-action`.

|          event name           | description                                                                                                               |               payload                |
|:-----------------------------:|:--------------------------------------------------------------------------------------------------------------------------|:------------------------------------:|
|          **options**          | Dispatched **after** editor options are created _(modules, toolbar, height ...)_ but **before** the editor is initialised |   ``QuillOptionsStatic``  instance   |
|          **connect**          | Dispatched **after** the editor is initialised with the options but before it has any content                             |      ``Quill`` editor  instance      |
|      **hydrate:before**       | Dispatched **after** the initial data is fetched, but **before** it is sent in quill editor instance                      |       quill ``Delta`` instance       |
|       **hydrate:after**       | Dispatched **after** the editor has been initialised **with** its data                                                    |      ``Quill`` editor  instance      |
|        **stt:result**         | Dispatched when speech recognition produces a result (interim or final)                                                   |  `{ text: string, isFinal: bool }`   |
|    **stt:listening-start**    | Dispatched when speech recognition starts listening                                                                       |                 `{}`                 |
|    **stt:listening-stop**     | Dispatched when speech recognition stops                                                                                  |                 `{}`                 |
|        **stt:error**          | Dispatched when a speech recognition error occurs                                                                         |           `{ error: any }`           |
|       **gallery:open**        | Dispatched when the media gallery modal is opened                                                                         |       `{ modal: HTMLElement }`       |
|       **gallery:close**       | Dispatched when the media gallery modal is closed                                                                         |        `{ modal: HTMLElement }`      |
|  **gallery:image-inserted**   | Dispatched when an image from the gallery is inserted into the editor                                                     |         `{ image: object }`          |
|  **gallery:upload-success**   | Dispatched when an image is successfully uploaded through the gallery                                                     |   `{ response: any, file: File }`    |
|   **counter:words-update**    | Dispatched when the word count is updated                                                                                 |         `{ value: number }`          |
| **counter:characters-update** | Dispatched when the character count is updated                                                                            |         `{ value: number }`          |
|    **reading-time:update**    | Dispatched when the estimated reading time is updated                                                                     | `{ minutes: number, words: number }` |


### Example of an extended controller to add Keyboard features
1. Create a new Stimulus controller inside your project
    ``` javascript
    // quill_extended_controller.js
    import { Controller } from '@hotwired/stimulus';
    
    export default class extends Controller {
        connect() {
            this.element.addEventListener('quill:connect', this._onConnect);
        }
    
        disconnect() {
            this.element.removeEventListener('quill:connect', this._onConnect);
        }
    
        _onConnect(event) {
            // The quill instance has been created
            console.log(event.detail); // You can access the quill instance using the event detail
            
            let quill = event.detail;
            // e.g : if you want to add a new keyboard binding
            quill.keyboard.addBinding({
                key: 'b',
                shortKey: true
            }, function(range, context) {
                this.quill.formatText(range, 'bold', true);
            });
              
            // e.g if you want to add a custom clipboard
            quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
                return new Delta().insert(node.data);
            });
        }
    }
    ```

2. Then in your form type
    ``` php
    use Ehyiah\QuillJsBundle\Form\QuillType;
    
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            // ...
            ->add('myField', QuillType::class, [
                'attr' => [
                    'data-controller' => 'quill-extended', // if you named your controller quill_extended_controller.js
                ]
            // ...
        ;
    }
    ```


# Easyadmin Integration
Integration will depend on how you handle assets in your project, AssetMapper or Webpack.

1. Optional first step

**If you already have an entrypoint JavaScript file that you want to re-use in admin then skip this step. And directly go to the AssetMapper or Webpack integration.**

Otherwise: create a quill-admin.js inside the assets directory
```
    // start the Stimulus application
    import './bootstrap';
```

2. See [AssetMapper](#When-using-AssetMapper) or [Webpack](#When-using-webpack)

### When using AssetMapper
create a new entry in importmap.php
(the key must be quill-admin as it is the name used in the built-in QuillAdminField, **but you can specify whatever you want as the actual JavaScript file in path**)
```
    'quill-admin' => [
        'path' => './assets/quill-admin.js',
        'entrypoint' => true,
    ],
```
and it should be done. but read below

WARNING => at the moment there seems to have an issue with easyadmin with the ->addAssetMapperEntries() function 
as I can not get it work as it should be.

a quick fix is to add in your **crudControllers**
```
    public function configureAssets(Assets $assets): Assets
    {
        $assets->addAssetMapperEntry('quill-admin');

        return parent::configureAssets($assets);
    }
```

OR

in your **Dashboard** controller
```
    public function configureAssets(): Assets
    {
        $assets = Assets::new();
        $assets->addAssetMapperEntry('quill-admin');

        return $assets;
    }
```

### When using webpack
- Create in webpack.config a new entry
(the entry name must be quill-admin as it is the name used in the built-in QuillAdminField, **but you can specify whatever you want as the actual JavaScript file in path**)
```
    .addEntry('quill-admin', './assets/quill-admin.js')
```
remember to recompile assets (yarn build/watch or npm equivalent).

## EasyAdmin Field usage
Then you can use the QuillAdminField like this :
```
    QuillAdminField::new('quill')
```

Or add custom options like you would do with the normal type
```
    QuillAdminField::new('quill')
        ->setFormTypeOptions([
            'quill_options' =>
                QuillGroup::build(
                    new BoldField(),
                    new ItalicField(),
                    new HeaderField(HeaderField::HEADER_OPTION_1),
                    new HeaderField(HeaderField::HEADER_OPTION_2),
                )
        ])
```
