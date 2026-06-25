# Other Modules

For other modules, you will need to extend Quill controller (see below) to use them as they required custom JavaScript as you cannot configure them in PHP.

|       modules       | description                                                                            |   name    | options type |                                                                 options                                                                 | default options |
|:-------------------:|:---------------------------------------------------------------------------------------|:---------:|:------------:|:---------------------------------------------------------------------------------------------------------------------------------------:|:---------------:|
| **KeyboardModule**  | The Keyboard module enables custom behavior for keyboard events in particular contexts | keyboard  |    array     | [see how to customize](/guide/advanced/extend-stimulus-controller)  ---  [available options](https://quilljs.com/docs/modules/keyboard) |        -        |
| **ClipboardModule** | The Clipboard handles copy, cut and paste between Quill and external applications      | clipboard |    array     |       [see how to customize](/guide/advanced/extend-stimulus-controller) ---  [site](https://quilljs.com/docs/modules/clipboard)        |        -        |
