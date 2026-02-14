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

Some events are dispatched:

| event name | description | payload | usage exemple |
| :---: | :--- | :---: | :--- |
| **options** | Dispatched **after** editor options are created _(modules, toolbar, height ...)_ but **before** the editor is initialised | ``QuillOptionsStatic`` instance | use it to custom quill options if needed, add new modules or edit options |
| **connect** | Dispatched **after** the editor is initialised with the options but before it has any content | ``Quill`` editor instance | |
| **hydrate:before** | Dispatched **after** the initial data is fetched, but **before** it is sent in quill editor instance | quill ``Delta`` instance | use this if you need to edit initial data before passed to the editor instance |
| **hydrate:after** | Dispatched **after** the editor has been initialised **with** its data | ``Quill`` editor instance | |
