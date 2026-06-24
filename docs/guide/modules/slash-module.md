# SlashModule

This module provides a powerful block selection menu that appears when you type `/` (at the beginning of a line or after a space). It allows you to transform the current line or create a new block (Heading, List, Quote, Code, etc.) without leaving the keyboard.

## Installation

The module is included in the bundle and registered automatically in the JavaScript controller. To use it, you only need to add it to your PHP form configuration.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\Modules\SlashModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SlashModule(),
    ],
]);
```

## Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| _(none currently)_ | | | |

## Features Detail

### Slash Menu
Type `/` to open the menu. You can then:
- Use **Heading 1, 2, or 3** to create titles.
- Use **Bullet List** or **Numbered List** for lists.
- Use **Quote** for blockquotes.
- Use **Code** for code blocks.
- Use **Text** to return to a normal paragraph.

**Behavior**:
- If you type `/` at the start of an empty line, selecting an item transforms that line.
- If you type `/` after some text, selecting an item creates a **new line** below with the chosen format, preserving what you already wrote.

## Try it live

Type `/` in the editor below to open the slash command menu.

<ClientOnly>
  <QuillPlayground
    enabled="slashModule"
    placeholder="Type / to open the slash command menu…"
  />
</ClientOnly>

## Visual Customization

The module injects its own CSS with a clean, modern aesthetic. You can override the styles in your own CSS using these classes:
- `.ql-slash-menu`: The slash command menu container.
- `.ql-slash-menu .item`: Individual items in the slash menu.
- `.ql-slash-menu .item-icon`: Icon container for each item.
- `.ql-slash-menu .item-label`: Label text for each item.
- `.ql-slash-menu .item-description`: Description text for each item.
