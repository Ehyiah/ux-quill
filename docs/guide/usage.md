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

### Using the Twig Component (Recommended)

The easiest way to display Quill content is to use the provided Twig component. It handles the necessary HTML wrappers and modes automatically. It does **not** load any CSS by itself — you stay in control of what stylesheets are shipped to the public page.

```twig
{# Default mode (class) #}
<twig:QuillContent value="{{ post.content }}" />

{# Inline mode #}
<twig:QuillContent value="{{ post.content }}" style="inline" />

{# Custom HTML tag and extra classes (extra attributes are passed through to the wrapper) #}
<twig:QuillContent tag="article" value="{{ post.content }}" class="my-custom-class" />
```

#### Loading the required CSS

When using the `class` style, the rendered HTML needs CSS to look right. The `<twig:QuillContent>` component **does not load any stylesheet by itself** — you decide what to ship to the page. There are up to three separate layers, and you load only what you need:

| Stylesheet | Purpose | Required? |
| --- | --- | --- |
| `quill.snow.css` | Core Quill theme — typography, headings, lists, alignment, colors, blockquotes, code, etc. | **Always**, in `class` style |
| `@ehyiah/ux-quill/dist/styles/quill-content.css` | **Structural** rules for advanced blots: `ql-page-break`, `ql-video`, `ql-image-figure` | Only if you use these blots |
| `@ehyiah/ux-quill/dist/styles/quill-content-theme.css` | **Cosmetic, opt-in** look for the `ql-mention` blot (background color, padding, font-weight…) | Optional — skip it to style mentions yourself |

> `<twig:QuillContent>` always wraps content with the `ql-snow` class. Quill's `bubble` theme is an editor look (popover toolbar) and brings no benefit on a read-only render — the produced HTML is identical. If you really want it, render the wrapper manually (see *Manual Display* below) and load `quill.bubble.css` via `quill_content_styles('bubble')`.

You have two ways to actually load them, depending on your asset pipeline.

##### Option A — AssetMapper

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

###### Where to call it

Put the helper in the `<head>` of your layout, inside the `stylesheets` block so child templates can override. Two common patterns:

**1. All pages render Quill content** — call it once in `base.html.twig`:

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

**2. Only some pages render Quill content** — opt in from the concerned template, avoiding the cost on pages that don't need it:

```twig
{# templates/blog/show.html.twig #}
{% extends 'base.html.twig' %}

{% block stylesheets %}
    {{ parent() }}
    {{ quill_content_styles() }}
{% endblock %}

{% block body %}
    <twig:QuillContent value="{{ post.content }}" />
{% endblock %}
```

The helper is idempotent per request — calling it from both `base.html.twig` and a child template is safe, each `<link>` is emitted only once.

##### Option B — Webpack Encore / your own bundler

Import the stylesheets explicitly in your CSS entry point. The helper does nothing here — load only the layers you actually want:

```css
/* always, in class style */
@import 'quill/dist/quill.snow.css';

/* only if you use page-break / video / image-figure blots */
@import '@ehyiah/ux-quill/dist/styles/quill-content.css';

/* only if you want the bundle's default look for mentions */
@import '@ehyiah/ux-quill/dist/styles/quill-content-theme.css';
```

### Manual Display

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
