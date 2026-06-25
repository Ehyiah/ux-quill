# Events

Some events are dispatched by the controller or its modules. **All events are prefixed** with `quill:`.
Since they all bubble, you can catch them on the element carrying the controller using `data-action`.

|          event name           | description                                                                                                               |               payload                |
|:-----------------------------:|:--------------------------------------------------------------------------------------------------------------------------|:------------------------------------:|
|          **options**          | Dispatched **after** editor options are created _(modules, toolbar, height ...)_ but **before** the editor is initialised |   ``QuillOptionsStatic``  instance   |
|          **connect**          | Dispatched **after** the editor is initialised with the options but before it has any content                             |      ``Quill`` editor  instance      |
|      **hydrate:before**       | Dispatched **after** the initial data is fetched, but **before** it is sent in quill editor instance                      |       quill ``Delta`` instance       |
|       **hydrate:after**       | Dispatched **after** the editor has been initialised **with** its data                                                    |      ``Quill`` editor  instance      |
|        **stt:result**         | Dispatched when speech recognition produces a result (interim or final)                                                   |  `{ text: string, isFinal: bool }`   |
|    **stt:listening-start**    | Dispatched when speech recognition starts listening                                                                       |                 `{}`                 |
|    **stt:listening-stop**     | Dispatched when speech recognition stops                                                                                  |                 `{}`                 |
|        **stt:error**          | Dispatched when a speech recognition error occurs                                                                         |           `{ error: any }`           |
|       **gallery:open**        | Dispatched when the media gallery modal is opened                                                                         |       `{ modal: HTMLElement }`       |
|       **gallery:close**       | Dispatched when the media gallery modal is closed                                                                         |        `{ modal: HTMLElement }`      |
|  **gallery:image-inserted**   | Dispatched when an image from the gallery is inserted into the editor                                                     |         `{ image: object }`          |
|  **gallery:upload-success**   | Dispatched when an image is successfully uploaded through the gallery                                                     |   `{ response: any, file: File }`    |
|   **counter:words-update**    | Dispatched when the word count is updated                                                                                 |         `{ value: number }`          |
| **counter:characters-update** | Dispatched when the character count is updated                                                                            |         `{ value: number }`          |
|    **reading-time:update**    | Dispatched when the estimated reading time is updated                                                                     | `{ minutes: number, words: number }` |
