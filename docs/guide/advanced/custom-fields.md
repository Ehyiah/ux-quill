# Custom Fields

If you need to add a field that is not provided by this bundle, you can create your own.
A field is a PHP class that defines how it should be represented in the Quill toolbar and which modules it might require.

## Create a Simple Field

To create a simple field that doesn't require any specific module, you need to implement `QuillInlineFieldInterface` 
(for inline formats like bold, italic) or `QuillBlockFieldInterface` (for block formats like headers).

### Example: Custom Inline Field

```php
namespace App\Quill\Fields;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;

class MyCustomField implements QuillInlineFieldInterface
{
    public function getOption(): string
    {
        // This must match the name of the format in QuillJS
        return 'my-format';
    }
}
```

## Create a Field with Auto-Imported Modules

If your field requires one or more Quill modules to function, you can implement `QuillFieldModuleInterface`. 
This will allow the bundle to automatically register and configure the required modules when your field is added to the toolbar.

### Example: Field requiring a Module

```php
namespace App\Quill\Fields;

use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillFieldModuleInterface;
use Ehyiah\QuillJsBundle\DTO\Fields\Interfaces\QuillInlineFieldInterface;
use App\Quill\Modules\MyCustomModule;

class MyFieldWithModule implements QuillInlineFieldInterface, QuillFieldModuleInterface
{
    public function getOption(): string
    {
        return 'custom-format';
    }

    public static function importModules(): array
    {
        // Return an array of module classes that should be auto-imported
        return [
            MyCustomModule::class,
        ];
    }
}
```

## Registering the Field

Once your field class is created, you can use it in your `QuillType` configuration:

```php
use App\Quill\Fields\MyCustomField;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;

$builder->add('content', QuillType::class, [
    'quill_options' => [
        QuillGroup::build(
            new MyCustomField(),
            // ...
        ),
    ],
]);
```

## JavaScript Implementation

Creating the PHP class is only half of the work. You also need to ensure that Quill knows how to handle your custom format or module on the frontend.

### For a Custom Format (Blot)
If you are adding a new format, you must define and register a **Blot** in your JavaScript.

### For a Custom Module
If your field requires a custom module, you must register it with Quill:

```javascript
import Quill from 'quill';
import MyCustomModule from './modules/MyCustomModule';

Quill.register('modules/myCustomModule', MyCustomModule);
```

You can do this by [extending the Stimulus controller](/guide/advanced/extend-stimulus-controller) 
or by creating a dedicated entry point if you are using AssetMapper.

> [!TIP]
> When you use objects (like `new MyCustomField()`) in `quill_options`, the bundle automatically detects if they implement `QuillFieldModuleInterface` and handles the module registration for you.
