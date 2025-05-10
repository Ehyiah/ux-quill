# QuillJs Bundle for Symfony using Symfony UX

Symfony UX Bundle implementing the Quill JS Wysiwyg https://quilljs.com/

If you need a easy to use WYSIWYG (with no complex configuration) into a symfony project this is what you need.

It comes with some extra features out of the box like image uploading to custom endpoint instead of base64 only.

2.x.x tags cover the new Quill v2

1.x.x tags cover the Quill v1.3.7 (no maintained)

* [Installation](#installation)


* [Basic Usage](#basic-usage)
* [Display Result](#display-result)


* [Customize quillJS with options and extra_options](#customize-options)

* [Handle images uploads](#image-upload-handling)
* [Handle images uploads security](#upload-endpoint-security)


* [Extend Quill stimulus controller](#extend-quill-stimulus-controller)


* [EasyAdmin Integration](#easyadmin-integration)
* [EasyAdmin Usage](#easyadmin-usage)

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

you can of course sanitize HTML if you need to for security reason, but don't forget to configure it
to your needs as many html balise and style elements will be removed by default.
Same goes in your Form configuration
```
    'sanitize_html' => false,
    'sanitizer' => 'my_awesome_sanitizer_config
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
                    // Or add all available fields at once
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

|   Field    | Description  | Available options  (options are available as class constants in each Field Class)  | Default option |
|:----------:|:------------:|:----------------------------------------------------------------------------------:|:--------------:|
| EmojiField | Add an emoji |                                         -                                          |                |



## quill_extra_options
|   extra_option_name   |  type  | values                                                                                                                                   |
|:---------------------:|:------:|:-----------------------------------------------------------------------------------------------------------------------------------------|
|       **debug**       | string | `` error``, ``warn``, ``log``, ``info``  (you can use ``DebugOption`` class constants to pick a value)                                   |
|      **height**       | string | examples: ``200px``, ``200em``, default: '200px'                                                                                         |
|       **theme**       | string | ``snow``, ``bubble`` , default: snow (you can use ``ThemeOption`` class constants to pick a value)                                       |
|    **placeholder**    | string |                                                                                                                                          |
|       **style**       | string | ``class``, ``inline``, choose how the style will be applied.                                                                             |
|  **upload_handler**   | array  | (explained [below](#image-upload-handling) (you can use ``UploadHandlerOption`` class constants to pick a value)                         |
| **use_semantic_html** |  bool  | will use the ``getSemanticHTML()`` instead of ``innerHTML`` _(can resolve some problems like https://github.com/slab/quill/issues/3957)_ |
|   **custom_icons**    | array  | customize icons by passing a SVG to replace the default quill icon (explained [below](#icons)                                            |
|     **read_ony**      |  bool  | to display quill in readOnly mode                                                                                                        |


### Image upload Handling
in ***ImageField*** : QuillJS transforms images in base64 encoded file by default to save your files.
However, you can specify a custom endpoint to handle image uploading and pass in response the entire public URL to display the image. 
#### currently handling 2 methods :

#### 1 : data sending in ``base64`` inside a ``application/json`` request
- in json mode data will look like this by calling ``$request->getContent()`` and ```application/json``` in content-type headers
```
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAQAAAAUb1BXAAAABGdBTUEAALGPC/xhBQAAACyygyyioiBqFCUIKC64x..."
```
#### 2 : sending in a ``multipart/form-data`` request
- in form mode you will find a ```multipart/form-data``` in content-type headers and file will be present in $request->files named ```file``` as a ``Symfony\Component\HttpFoundation\File\UploadedFile``
- then you can handle it like you would do with a FileType and access the file like this : 
```php
    /** @var \Symfony\Component\HttpFoundation\Request $request */
    /** @var \Symfony\Component\HttpFoundation\File\UploadedFile $file */
    $file = $request->files->get('file'))
```

#### upload mode configuration :
**exemple of a json configuration to send request to the upload endpoint that returns a json response containing the URL to the uploaded image.**
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
| security options |  type  | default values |  possible values   | explaination                                                                                                                                                                                                     |
|:----------------:|:------:|:--------------:|:------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|     **type**     | string |      null      | ``jwt``, ``basic`` | with ``jwt`` a header will be added in the post request ``'authorization'  => 'Bearer MY_JWT_TOKEN'``, with ``basic`` a header will be added in the post request ``'basic' => 'Basic YmFiYXI6cGFzcy1iYWJhcg=='`` |
|  **jwt_token**   | string |      null      |                    | pass a valid JWT token for your upload endpoint (don't specify Bearer, it will be added automatically)                                                                                                           |
|   **username**   | string |      null      |                    | the username of your basic http user                                                                                                                                                                             |
|   **password**   | string |      null      |                    | the password of your basic http user                                                                                                                                                                             |

**exemple of a json configuration with jwt security.**
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
- If your response is a Json response like a ``Symfony\Component\HttpFoundation\JsonResponse``, the ``json_response_file_path`` option can be used to specify the url inside the json response.
in the exemple below ``json_path_file_response`` must be ``'file.url'``.
```php
    return new JsonResponse([
        'file' => [
            'url' => 'https://my-website/public/assets/my-uploaded-image.jpg',
        ]
    ]);
```
- If your response is a Json response like a ``Symfony\Component\HttpFoundation\JsonResponse``, **and** the ``json_response_file_path`` is **null**.
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

```php
    'modules' => [
        new SyntaxModules(),
    ],
```


|       modules        | auto-imported |                                                                   description                                                                    |     name      | options type |                options                |                         default options                         |
|:--------------------:|:-------------:|:------------------------------------------------------------------------------------------------------------------------------------------------:|:-------------:|:------------:|:-------------------------------------:|:---------------------------------------------------------------:|
|   **EmojiModule**    |      YES      |                                                       required if emoji Field is activated                                                       | emoji-toolbar |    string    |                 NONE                  |                           ``'true'``                            |
|   **ResizeModule**   |      YES      |                                      used in ImageField,  https://www.npmjs.com/package/quill-resize-image                                       |    resize     |    array     |                  []                   |                               []                                |
|   **SyntaxModule**   |      YES      |                      To use with CodeBlockField field, see official [description](https://quilljs.com/docs/modules/syntax)                       |    syntax     |    string    |                 NONE                  |                           ``'true'``                            |
|  **HistoryModule**   |      NO       | The History module is responsible for handling undo and redo for Quill. see details on official [site](https://quilljs.com/docs/modules/history) |    history    |    array     | ``delay``, ``maxStack``, ``userOnly`` | ['delay' => '1000', 'maxStack' => '100', 'userOnly' => 'false'] |
| **SmartLinksModule** |      NO       |                                        automatic recognition of links (can be customized within options)                                         |  smartLinks   |    array     |             ``linkRegex``             |                 ['linkRegex' => '/https?:\/\/[^\s]+/']          |

### Other modules 
For other modules, you will need to extends Quill controller (see below) to use them.

|       modules       |                                                                description                                                                |     name      | options type |                               options                               |                         default options                         |
|:-------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------:|:-------------:|:------------:|:-------------------------------------------------------------------:|:---------------------------------------------------------------:|
| **KeyboardModule**  | The Keyboard module enables custom behavior for keyboard events in particular contexts [site](https://quilljs.com/docs/modules/keyboard)  |   keyboard    |    array     | [see next documentation section](#extend-quill-stimulus-controller) |                                -                                |
| **ClipboardModule** | The Clipboard handles copy, cut and paste between Quill and external applications [site](https://quilljs.com/docs/modules/clipboard)      |   clipboard   |    array     | [see next documentation section](#extend-quill-stimulus-controller) |                                -                                |

### icons
You can customize icons used in toolbar
exemple :
```php
    'quill_extra_options' => [
        /// other extra options
        'custom_icons' => [
            'bold' => '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#2488FF;" d="M478.609,300.522v-33.39h-33.391v-66.784h33.391l0,0l0,0V66.783h-33.391v-33.39h-33.391V0H0v100.174 h33.39v311.652H0V512h445.217v-33.39h33.391v-0.001l0,0v-33.391l0,0l0,0H512V300.522H478.609z M345.043,378.435H166.957v-44.522 h178.087V378.435z M345.043,155.826H166.957v-33.391h178.087V155.826z"></path> <polygon style="fill:#005ECE;" points="478.609,300.522 478.609,267.132 445.217,267.132 445.217,200.348 478.609,200.348 478.609,200.348 478.609,200.348 478.609,66.783 445.217,66.783 445.217,33.392 411.826,33.392 411.826,0 256,0 256,122.435 345.043,122.435 345.043,155.826 256,155.826 256,333.913 345.043,333.913 345.043,378.435 256,378.435 256,512 445.217,512 445.217,478.61 478.609,478.61 478.609,478.609 478.609,478.609 478.609,445.217 478.609,445.217 478.609,445.217 512,445.217 512,300.522 "></polygon> <rect x="33.391" y="100.174" width="33.391" height="311.652"></rect> <polygon points="33.391,411.826 0,411.826 0,512 445.217,512 445.217,478.609 33.391,478.609 "></polygon> <polygon points="411.826,33.391 411.826,0 0,0 0,100.174 33.391,100.174 33.391,33.391 "></polygon> <rect x="411.826" y="33.391" width="33.391" height="33.391"></rect> <rect x="445.217" y="66.783" width="33.391" height="133.565"></rect> <rect x="478.609" y="300.522" width="33.391" height="144.696"></rect> <rect x="445.217" y="445.217" width="33.391" height="33.391"></rect> <polygon points="378.435,189.217 378.435,122.435 345.043,122.435 345.043,155.826 166.957,155.826 166.957,122.435 345.043,122.435 345.043,89.043 133.565,89.043 133.565,189.217 "></polygon> <polygon points="345.043,378.435 166.957,378.435 166.957,333.913 345.043,333.913 345.043,300.522 133.565,300.522 133.565,411.826 378.435,411.826 378.435,333.913 345.043,333.913 "></polygon> <polygon points="411.826,233.739 378.435,233.739 378.435,267.13 445.217,267.13 445.217,200.348 411.826,200.348 "></polygon> <rect x="445.217" y="267.13" width="33.391" height="33.391"></rect> </g></svg>',
            'italic' => '<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z"></path> <path d="M272.562,361.891L271.016,368H192l1.984-6.109c7.922-0.219,13.172-1,15.719-2.312c4.141-1.875,7.219-4.469,9.203-7.766 c3.109-5.172,6.312-14.422,9.625-27.75l33.406-135.125c2.844-11.25,4.25-19.719,4.25-25.438c0-2.875-0.625-5.297-1.828-7.281 c-1.234-1.969-3.094-3.5-5.594-4.531c-2.516-1.062-7.391-1.578-14.672-1.578l1.719-6.109H320l-1.562,6.109 c-6.031-0.109-10.516,0.672-13.453,2.312c-4.234,2.203-7.484,5.344-9.688,9.422c-2.234,4.062-5.078,13.094-8.578,27.094 l-33.266,135.125c-3.016,12.438-4.531,20.375-4.531,23.781c0,2.75,0.578,5.094,1.766,7.031c1.188,1.922,3.078,3.406,5.656,4.453 C258.938,360.375,264.359,361.234,272.562,361.891z"></path> </g></svg>',
            // OR use the class getName() method.
            new (\Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField())->getName() => '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#2488FF;" d="M478.609,300.522v-33.39h-33.391v-66.784h33.391l0,0l0,0V66.783h-33.391v-33.39h-33.391V0H0v100.174 h33.39v311.652H0V512h445.217v-33.39h33.391v-0.001l0,0v-33.391l0,0l0,0H512V300.522H478.609z M345.043,378.435H166.957v-44.522 h178.087V378.435z M345.043,155.826H166.957v-33.391h178.087V155.826z"></path> <polygon style="fill:#005ECE;" points="478.609,300.522 478.609,267.132 445.217,267.132 445.217,200.348 478.609,200.348 478.609,200.348 478.609,200.348 478.609,66.783 445.217,66.783 445.217,33.392 411.826,33.392 411.826,0 256,0 256,122.435 345.043,122.435 345.043,155.826 256,155.826 256,333.913 345.043,333.913 345.043,378.435 256,378.435 256,512 445.217,512 445.217,478.61 478.609,478.61 478.609,478.609 478.609,478.609 478.609,445.217 478.609,445.217 478.609,445.217 512,445.217 512,300.522 "></polygon> <rect x="33.391" y="100.174" width="33.391" height="311.652"></rect> <polygon points="33.391,411.826 0,411.826 0,512 445.217,512 445.217,478.609 33.391,478.609 "></polygon> <polygon points="411.826,33.391 411.826,0 0,0 0,100.174 33.391,100.174 33.391,33.391 "></polygon> <rect x="411.826" y="33.391" width="33.391" height="33.391"></rect> <rect x="445.217" y="66.783" width="33.391" height="133.565"></rect> <rect x="478.609" y="300.522" width="33.391" height="144.696"></rect> <rect x="445.217" y="445.217" width="33.391" height="33.391"></rect> <polygon points="378.435,189.217 378.435,122.435 345.043,122.435 345.043,155.826 166.957,155.826 166.957,122.435 345.043,122.435 345.043,89.043 133.565,89.043 133.565,189.217 "></polygon> <polygon points="345.043,378.435 166.957,378.435 166.957,333.913 345.043,333.913 345.043,300.522 133.565,300.522 133.565,411.826 378.435,411.826 378.435,333.913 345.043,333.913 "></polygon> <polygon points="411.826,233.739 378.435,233.739 378.435,267.13 445.217,267.13 445.217,200.348 411.826,200.348 "></polygon> <rect x="445.217" y="267.13" width="33.391" height="33.391"></rect> </g></svg>',
            new (\Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField())->getName() => '<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z"></path> <path d="M272.562,361.891L271.016,368H192l1.984-6.109c7.922-0.219,13.172-1,15.719-2.312c4.141-1.875,7.219-4.469,9.203-7.766 c3.109-5.172,6.312-14.422,9.625-27.75l33.406-135.125c2.844-11.25,4.25-19.719,4.25-25.438c0-2.875-0.625-5.297-1.828-7.281 c-1.234-1.969-3.094-3.5-5.594-4.531c-2.516-1.062-7.391-1.578-14.672-1.578l1.719-6.109H320l-1.562,6.109 c-6.031-0.109-10.516,0.672-13.453,2.312c-4.234,2.203-7.484,5.344-9.688,9.422c-2.234,4.062-5.078,13.094-8.578,27.094 l-33.266,135.125c-3.016,12.438-4.531,20.375-4.531,23.781c0,2.75,0.578,5.094,1.766,7.031c1.188,1.922,3.078,3.406,5.656,4.453 C258.938,360.375,264.359,361.234,272.562,361.891z"></path> </g></svg>',
        ]
    ],
```

## Extend Quill stimulus controller
If you need to extend default behavior of built-in controller, this is possible.
exemple : you need to modify modules registration and/or add custom javascript to modify quill behaviour.

Some modules like ``Keyboard`` and ``Clipboard`` need custom javascript to be written.
The easiest way to do so is to create a custom stimulus controller to extend the default behavior.

Create a new stimulus controller inside your project

some events are dispatched : ``connect``, ``options``

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
        // The quill has been created
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

Then in your form
``` php
use Ehyiah\QuillJsBundle\Form\QuillType;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        // ...
        ->add('myField', QuillType::class, [
            'attr' => [
                'data-controller' => 'quill-extended',
            ]
        // ...
    ;
}
```


# Easyadmin Integration
- First create a quill-admin.js inside assets directory
```
    // start the Stimulus application
    import './bootstrap';
```
## When using AssetMapper
create a new entry in importmap.php
(the key must be quill-admin as it is the name used in the built-in QuillAdminField)
```
    'quill-admin' => [
        'path' => './assets/quill-admin.js',
        'entrypoint' => true,
    ],
```
and it should be done. but read below

WARNING => at the moment there seems to have an issue with easyadmin with the ->addAssetMapperEntries() function 
as I can not get it work as it should be.
a quick fix is to add in your crudControllers
```
    public function configureAssets(Assets $assets): Assets
    {
        $assets->addAssetMapperEntry('quill-admin');
        return parent::configureAssets($assets); // TODO: Change the autogenerated stub
    }
```

OR

in your dashboard
```
    public function configureAssets(): Assets
    {
        $assets = Assets::new();
        $assets->addAssetMapperEntry('quill-admin');

        return $assets;
    }
```

## When using webpack
- Next create in webpack.config a new entry
(the entry name must be quill-admin as it is the name used in the built-in QuillAdminField)
```
    .addEntry('quill-admin', './assets/quill-admin.js')
```
don't forget to recompile assets (yarn build/watch or npm equivalent).

## EasyAdmin usage
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
