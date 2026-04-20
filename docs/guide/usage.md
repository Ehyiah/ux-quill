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

How you display the content depends on the `style` option used during entry (see [Quill Options](./configuration/quill-options.md)).

### 1. Default Styling (Class based)

By default, Quill uses CSS classes (e.g., `ql-align-center`, `ql-indent-1`) to format content.

**Requirement:** You **must** include the Quill CSS on your frontend page, and the content must be wrapped in specific classes:

```twig
{# 1. Ensure Quill CSS is loaded on this page, exemple #}
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />

{# 2. Wrap the content #}
<div class="ql-snow">
    <div class="ql-editor">
        {{ myField|raw }}
    </div>
</div>
```

### 2. Inline Styling

If you configured the field with `'style' => 'inline'`, Quill writes styles directly into the HTML tags (e.g., `style="text-align: center;"`).

**Pros:**
- Content looks correct even without the Quill CSS on the frontend.
- Ideal for emails or RSS feeds.

**Cons & Limitations:**
- **Incomplete coverage:** While alignment, colors, fonts, and indentation are handled inline, some complex elements still require CSS:
    - **Videos:** The `.ql-video` class is needed for proper sizing.
    - **Code Blocks:** The `.ql-syntax` class and a syntax highlighter (like highlight.js) are needed.
    - **Formulas:** KaTeX CSS is still required.
- **HTML Weight:** The resulting HTML is slightly heavier due to repeated style attributes.

```twig
<div>{{ myField|raw }}</div>
```

For the most basic usage, this is only what you have to do.
