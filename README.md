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

### Step 2: install the JavaScript package (Webpack Encore or Symfony Reprise)

Not needed with AssetMapper. Install the npm package, declare the bundle controllers
in `assets/controllers.json`, and let your bundler rebuild:

```sh
npm install @ehyiah/ux-quill
npm run dev   # or npm run build
```

See the [installation guide](docs/guide/installation.md) for the `controllers.json`
entry, the auto-imported stylesheets, and the Symfony Reprise (Vite / Rsbuild) setup.

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
In a twig template, the easiest way is to use the provided Twig component:

```twig
{# emits the required <link> tags once per request (AssetMapper only) #}
{{ quill_content_styles() }}

<twig:QuillContent value="{{ post.content }}" />
```

The component only renders the HTML wrappers; it does not pull any CSS by itself. Use `quill_content_styles()` (AssetMapper) or import the stylesheets in your CSS entry (Webpack). See [usage docs](docs/guide/usage.md#loading-the-required-css) for details, including the opt-in cosmetic stylesheet for mentions.

For inline style (no CSS required on frontend):
```twig
<twig:QuillContent value="{{ post.content }}" style="inline" />
```

Or manually:

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
