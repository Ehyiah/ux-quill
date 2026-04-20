# NotionToolbarModule

This module provides a modern, "Notion-like" editing experience. It is designed to keep the interface clean by hiding formatting options until they are needed.

It includes two main features:
1.  **Floating Selection Toolbar**: A context menu that appears automatically when you select text, offering quick access to common formatting (Bold, Italic, Underline, and Strikethrough).
2.  **Slash Command Menu**: A powerful block selection menu that appears when you type `/` (at the beginning of a line or after a space). It allows you to transform the current line or create a new block (Heading, List, Quote, Code, etc.) without leaving the keyboard.

## Installation

The module is included in the bundle and registered automatically in the JavaScript controller. To use it, you only need to add it to your PHP form configuration.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\Modules\NotionToolbarModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new NotionToolbarModule(
            slashMenu: true,
            floatingToolbar: true
        ),
    ],
]);
```

## Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **slashMenu** | `bool` | Enables the `/` command menu. | `true` |
| **floatingToolbar** | `bool` | Enables the floating toolbar on text selection. | `true` |

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

### Floating Toolbar
When you select text with your mouse or keyboard, a small bubble appears above the selection.
- It displays icons for **Bold**, **Italic**, **Underline**, and **Strikethrough**.
- The icons reflect the current state of the selection (e.g., the Bold icon is highlighted if the text is already bold).

## Visual Customization

The module injects its own CSS with a clean, modern aesthetic (white background, soft shadows). You can override the styles in your own CSS using these classes:
- `.ql-notion-toolbar`: The floating bubble container.
- `.ql-notion-slash-menu`: The slash command menu container.
- `.ql-notion-slash-menu .item`: Individual items in the slash menu.
