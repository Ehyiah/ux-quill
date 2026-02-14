# ReadTimeModule

This module calculates the estimated reading time based on the content of the editor.
It displays the result in the toolbar by default, or in a specific element if targeted.

## Options

- **wpm**: Words per minute used for calculation (default: `200`)
- **label**: Text displayed before the time (default: `'⏱ Reading time: ~ '`)
- **suffix**: Text displayed after the time (default: `' minute(s)'`)
- **readTimeOk**: Threshold in minutes for the "green" indicator (short read) (default: `5`)
- **readTimeMedium**: Threshold in minutes for the "orange" indicator (medium read) (default: `8`)
- **target**: ID selector of a DOM element to display the reading time (e.g., `'#my-counter'`). If not set, it appears in the toolbar.

## Usage example

```php
'modules' => [
    new ReadTimeModule([
        'wpm' => '250',
        'target' => '#reading-time-display',
    ]),
],
```
