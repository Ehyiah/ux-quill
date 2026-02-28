# QuillJs Bundle for Symfony using Symfony UX

<div align="center">
  <img src="./quill_logo.png" alt="Melody logo" width="400"/>
</div>

Symfony UX Bundle implementing the Quill JS Wysiwyg https://quilljs.com/

Also, Working out of the with EasyAdmin

> **New Documentation**: [https://ehyiah.github.io/ux-quill/](https://ehyiah.github.io/ux-quill/)

If you need an easy-to-use WYSIWYG (with no complex configuration) into a symfony project, this is what you need.

* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [Display Result](#display-result)

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
