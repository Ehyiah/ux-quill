# Usage

## Basic Usage

In a form, use `QuillType`. It works like a classic Type except it has more options:

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Symfony\Component\Form\FormBuilderInterface;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        // ...
        ->add('myField', QuillType::class)
    ;
}
```

## Display Result

In a Twig template:

- If you use the default class styling option you may need to encapsulate the content so the quill stylesheet can be applied like this:

```twig
<div class="ql-snow">
    <div class="ql-editor">
        {{ myField|raw }}
    </div>
</div>
```

- If you use the inline styling option simply:

```twig
<div>{{ myField|raw }}</div>
```

For the most basic usage, this is only what you have to do.
