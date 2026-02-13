# FullScreenModule

This module adds a button to the toolbar that allows toggling the editor into fullscreen mode.

It uses the [quill-toggle-fullscreen-button](https://github.com/qvarts/quill-toggle-fullscreen-button) library.

## Options

| Option | Type | Description | Default |
| :---: | :---: | :--- | :---: |
| **buttonTitle** | string | The title attribute of the button (tooltip) | 'Toggle Fullscreen' |
| **buttonHTML** | string | The HTML content of the button (icon) | (default SVG icon) |

## Usage example

```php
use Ehyiah\QuillJsBundle\DTO\Modules\FullScreenModule;

'modules' => [
    new FullScreenModule([
        'buttonTitle' => 'Maximize',
    ]),
],
```
