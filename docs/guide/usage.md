---
outline: [2, 5]
---

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

### Toolbar Presets (fast configuration with built-in presets)

The bundle ships with a few ready-made toolbar compositions exposed by `QuillGroup`. Pick the preset that matches the context, or assemble your own with `QuillGroup::build(...)`.

| Preset                                               | Intended use | Notable fields |
|------------------------------------------------------| --- | --- |
| `QuillGroup::buildMinimal()`                         | Comments, short descriptions, note fields. | bold, italic, underline, link, clean |
| `QuillGroup::buildForNewsletter()`                   | Newsletter / email content: light formatting, no technical fields. | text emphasis, headings, colors, alignment, lists, image |
| `QuillGroup::buildAdvanced()`                        | Rich editorial content for blog articles. | full text formatting, headings, lists, media, code, table |
| `QuillGroup::buildWithAllFields()` _see below warning_ | Every available field, including specialised ones (formula, RTL direction, script, font, emoji). | all |

::: warning
**QuillGroup::buildWithAllFields()** is deprecated and will be removed in a future version (v4.0.0). 
Because all the fields cannot be included anymore (_e.g. ImageGalleryField cannot be included as this field require an explicit configuration in order to work_).
:::

Example:

```php
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'quill_options' => [
        QuillGroup::buildForNewsletter(),
    ],
]);
```

### Minimal Display working example with **AssetMapper**:

```twig
{# templates/my_template.html.twig #}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>{% block title %}{% endblock %}</title>

        {% block stylesheets %}
            {{ quill_content_styles() }}
        {% endblock %}
    </head>

    <body>
        {% block body %}
            <twig:QuillContent value="{{ post.content }}" />
        {% endblock %}
    </body>
</html>
```


## Detailled Display Result using Built-in mechanisms

How you display the content depends on the `style` option used during entry (see [Quill Options](./configuration/quill-options.md)).

### Twig Component (Recommended)

The easiest way to display Quill content is to use the provided Twig component. 

It handles the necessary HTML wrappers and modes automatically. 

It does **not** load any CSS by itself — you stay in control of what stylesheets are shipped to the public page.

```twig
{# Default mode (class) #}
<twig:QuillContent value="{{ post.content }}" />

{# Inline mode #}
<twig:QuillContent value="{{ post.content }}" style="inline" />

{# Custom HTML tag and extra classes (extra attributes are passed through to the wrapper) #}
<twig:QuillContent tag="article" value="{{ post.content }}" class="my-custom-class" />
```

> `<twig:QuillContent>` always wraps content with the `ql-snow` class. Quill's `bubble` theme is an editor look (popover toolbar) and brings no benefit on a read-only render — the produced HTML is identical. If you really want it, render the wrapper manually (see *Manual Display* below) and load `quill.bubble.css` via `quill_content_styles('bubble')`.


### Loading the required CSS

When using the `class` style, the rendered HTML needs CSS to look right. 

The `<twig:QuillContent>` component **does not load any stylesheet by itself** — you decide what to ship to the page. 

#### AssetMapper

::: tip
The easiest way to ship the required CSS is to use the provided Twig helper function in your layout head.
:::

A Twig helper is shipped to emit the corresponding `<link>` tags. Call it once in your layout (it is idempotent per request — each stylesheet is emitted at most once even if the helper is called several times):

```twig
{# in your <head> — minimum: snow theme + structural rules #}
{{ quill_content_styles() }}

{# bubble theme instead of snow #}
{{ quill_content_styles('bubble') }}

{# also load the opt-in cosmetic stylesheet for mentions #}
{{ quill_content_styles('snow', true) }}
```

Signature: `quill_content_styles(theme = 'snow', cosmetic = false)`.

The helper resolves URLs through AssetMapper. Make sure the assets are reachable through your importmap, e.g.:

```bash
php bin/console importmap:require quill/dist/quill.snow.css
```

If an asset cannot be resolved (not in the importmap, AssetMapper not installed…), no `<link>` is emitted for it — silently. The bundle's own stylesheets (`quill-content.css` and `quill-content-theme.css`) are already exposed by the bundle, you don't need to require them manually.

###### Where to call it, **All pages rendering Quill content**:

Put the helper in the `<head>` of your layout, inside the `stylesheets` block so child templates can override. Two common patterns:

```twig
{# templates/base.html.twig #}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>{% block title %}{% endblock %}</title>

        {% block stylesheets %}
            {{ quill_content_styles() }}
        {% endblock %}

        {% block javascripts %}
            {% block importmap %}{{ importmap('app') }}{% endblock %}
        {% endblock %}
    </head>
    <body>
        {% block body %}{% endblock %}
    </body>
</html>
```

The helper is idempotent per request — calling it from both `base.html.twig` and a child template is safe, each `<link>` is emitted only once.

#### Webpack Encore / your own bundler

Import the stylesheets explicitly in your CSS entry point. The helper does nothing here — load only the layers you actually want:

```css
@import 'quill/dist/quill.snow.css';

@import '@ehyiah/ux-quill/dist/styles/quill-content.css';

@import '@ehyiah/ux-quill/dist/styles/quill-content-theme.css';
```

You can take a look at the css layers in the [CSS layers section](#explaining-the-css-layers) to know which ones you need.

## Manual Display

If you prefer to wrap the content manually:

#### 1. Default Styling (Class based)

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

#### 2. Inline Styling

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


## Explaining the CSS layers
There are up to three separate layers, and you load only what you need:

| Stylesheet | Twig call (with assetMapper)                                         | When do you need it                                                   | Fields                                                    | Modules | Required? |
| --- |----------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------| --- | --- |
| `quill.snow.css` | <span v-pre>{{ quill_content_styles() }}</span>                      | Always when using `class` style                                       | All quill built-in fields (ImageField is overriden in this bundle) | — | ✅ Yes |
| `@ehyiah/ux-quill/dist/styles/quill-content.css` | Always included with <span v-pre>{{ quill_content_styles() }}</span> | Structural rules for advanced blots — page-break, video, image-figure | `PageBreakField`, `VideoField`, `ImageField`              | `PageBreakModule`, `ImageSelectionModule` | ⚠️ Only if you use these fields |
| `@ehyiah/ux-quill/dist/styles/quill-content-theme.css` | <span v-pre>{{ quill_content_styles(cosmetic=true) }}</span>         | Cosmetic built-in style                                               | — | `MentionModule` | ❌ Optional — style them yourself otherwise |


