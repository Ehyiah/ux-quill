# Extra Options

This section covers global configuration options for the editor instance, including styling, assets, and image handling.

## quill_extra_options

| Option | Type | Details |
| :---: | :---: | :--- |
| **debug** | string | ``error``, ``warn``, ``log``, ``info`` |
| **height** | string | e.g. ``200px``, ``200em`` (default: '200px') |
| **theme** | string | ``snow``, ``bubble`` (default: snow) |
| **placeholder** | string | Placeholder text |
| **style** | string | ``class`` or ``inline`` |
| **upload_handler** | array | Configuration for image uploads (see [Image Upload Handling](/guide/configuration/image-upload)) |
| **use_semantic_html** | bool | Use ``getSemanticHTML()`` instead of ``innerHTML`` |
| **custom_icons** | array | Replace default SVG icons |
| **read_only** | bool | Display in read-only mode |
| **assets** | array | Custom stylesheets or scripts |

## Assets

You can inject custom CSS or JS (e.g. for Katex or Highlight.js).

```php
'quill_extra_options' => [
   'assets' => [
       'styleSheets' => [
           "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
       ],
       'scripts' => [
           "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js",
       ]
   ],
]
```

## Custom Icons

Replace toolbar icons with your own SVGs.

```php
'quill_extra_options' => [
    'custom_icons' => [
        'bold' => '<svg ...>...</svg>',
        'italic' => '<svg ...>...</svg>',
    ]
],
```
