# Advanced Usage

## Extend Quill stimulus controller

If you need to extend the default behavior of the built-in controller, this is possible.
For example, you need to modify module registration and/or add custom JavaScript to modify quill behavior.

Some modules like ``Keyboard`` and ``Clipboard`` need custom JavaScript to be written.
The easiest way to do so is to create a custom stimulus controller to extend the default behavior.

You can do this easily by attaching to various events to avoid being forced to rewrite the entire controller.
### Example of an extended controller to add Keyboard features

1. Create a new Stimulus controller inside your project

```javascript
// quill_extended_controller.js
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    connect() {
        this.element.addEventListener('quill:connect', this._onConnect);
    }

    disconnect() {
        this.element.removeEventListener('quill:connect', this._onConnect);
    }

    _onConnect(event) {
        // The quill instance has been created
        console.log(event.detail); // You can access the quill instance using the event detail
        
        let quill = event.detail;
        // e.g : if you want to add a new keyboard binding
        quill.keyboard.addBinding({
            key: 'b',
            shortKey: true
        }, function(range, context) {
            this.quill.formatText(range, 'bold', true);
        });
          
        // e.g if you want to add a custom clipboard
        quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
            return new Delta().insert(node.data);
        });
    }
}
```

2. Then in your form type

```php
use Ehyiah\QuillJsBundle\Form\QuillType;

public function buildForm(FormBuilderInterface $builder, array $options)
{
    $builder
        // ...
        ->add('myField', QuillType::class, [
            'attr' => [
                'data-controller' => 'quill-extended', // if you named your controller quill_extended_controller.js
            ]
        // ...
    ;
}
```

## Events

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
