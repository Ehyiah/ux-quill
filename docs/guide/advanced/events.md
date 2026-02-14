# Events

Some events are dispatched:

| event name | description | payload | usage exemple |
| :---: | :--- | :---: | :--- |
| **options** | Dispatched **after** editor options are created _(modules, toolbar, height ...)_ but **before** the editor is initialised | ``QuillOptionsStatic`` instance | use it to custom quill options if needed, add new modules or edit options |
| **connect** | Dispatched **after** the editor is initialised with the options but before it has any content | ``Quill`` editor instance | |
| **hydrate:before** | Dispatched **after** the initial data is fetched, but **before** it is sent in quill editor instance | quill ``Delta`` instance | use this if you need to edit initial data before passed to the editor instance |
| **hydrate:after** | Dispatched **after** the editor has been initialised **with** its data | ``Quill`` editor instance | |
