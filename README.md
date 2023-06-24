# QuillJs Bundle for Symfony using Symfony UX

## Installation

```sh
composer require ehyiah/ux-quill

# Don't forget to install the JavaScript dependencies as well and compile
npm install --force
npm run watch

# or use yarn
yarn install --force
yarn watch
```
## Post installation
- add to package.json in your project : 
```
    "dependencies": {
        "@ehyiah/ux-quill" : "file:vendor/ehyiah/ux-quill/src/assets"
    }
```
- next in controllers.json :
```
    "controllers": {
        "@ehyiah/ux-quill": {
            "quill": {
                "enabled": true,
                "fetch": "eager",
                "autoimport": {
                    "quill/dist/quill.snow.css": true,
                    "quill/dist/quill.bubble.css": false
                }
            }
        }
    }
```

then you can use the QuillType to build a QuillJs WYSIWYG

## Usage
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

For the most basic this is only what you have to do.
## Options
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
                // you can also build your groups using a classic array but many clases are covering almost every Quill Fields see below
                    QuillGroup::build(
                        new BoldInlineField(),
                        new ItalicInlineField(),
                        // and many more
                    ),
                    QuillGroup::build(
                        new HeaderField(HeaderField::HEADER_OPTION_1),
                        new HeaderField(HeaderField::HEADER_OPTION_2),
                        // and many more
                    )
                ]
            ])
        ;
    }
```

### quill_extra_options:

- **debug**: type:string, values: 'error', 'warn', 'log', 'info'
- **height**: type string, examples: 200px, 200em, default: '200px'
- **theme**: type: string, values: 'snow', 'bubble', default: 'snow'
- **placeholder**: type: string

### quill_options

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
          new BoldInlineField(),
          new ItalicInlineField(),
      )
```
This example will display a h1 and h2 header options side by side and another Group containing a Bold and an Italic fields

You can add as many Groups as you like or just One if you don't need the WYSIWYG options to have spaces beetwen them.


Many fields have options:

### Fields
- ***HeaderField*** 


