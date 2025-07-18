# 3.0.0 Break-changes

## PHP modifications
- Move from twig template to JavaScript hydration of quill initial content. Move logic inside JavaScript for better compatibility with deltas, so initial content is now set in JavaScript and not in the template anymore (because of the table module)
- Remove sanitizer options see the below points : (symfony/html-sanitizer is no longer required when installing the bundle)
  1. If ``sanitize_html`` first level option was present, it was sanitizing HTML before passing it to the quill instance. It doesn't really make sense and was preventing the table module from working.
  2. Remove from ``quill_extra_options`` the ``sanitizer`` option, use **symfony default** sanitizing process when saving data instead. See [Official doc here](#https://symfony.com/doc/current/html_sanitizer.html#sanitizing-html-from-form-input)
- ``ModuleInterface`` add a __contruct method in interface and some comments.

## Javascript modification
- set quill initial content (when editing) in quill initialization instead of twig template.

# 2.1.0 Break-changes
- RENAME ``path`` to ``upload_endpoint`` for easier understanding in ``upload_handler`` options.
- MOVING ``modules`` to the top level (like quill_options or quill_extra_options)
