# 3.0.0 Break-changes
## PHP modifications
- remove ``sanitize_html`` first level option, it was sanitizing HTML before passing it to the quill instance. It doesn't really make sense and was preventing the table module from working. use a sanitizer to save data instead.
- remove from twig template hydration of quill initial content to move logic inside javascript for better compatibility with deltas so initial content is now setted in javascript and not in template anymore (because of table module)
- remove first level option ``sanitize_html`` and only keep sanitizer in ``quill_extra_options``
## Javascript modification
- set quill initial content (when editing) in quill initialization instead of twig template.

# 2.1.0 Break-changes
- RENAME ``path`` to ``upload_endpoint`` for easier understanding in ``upload_handler`` options.
- MOVING ``modules`` to the top level (like quill_options or quill_extra_options)
