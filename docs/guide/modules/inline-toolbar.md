# InlineToolbarModule

This module provides a floating selection toolbar that appears automatically when you select text, offering quick access to common formatting (Bold, Italic, Underline, and Strikethrough). It is designed to keep the interface clean by hiding formatting options until they are needed.

When the [AiAssistantModule](/guide/modules/ai-assistant) is also enabled, the AI Assistant star button is automatically added to the inline toolbar so users can open the AI menu directly from a text selection.

## Installation

The module is included in the bundle and registered automatically in the JavaScript controller. To use it, you only need to add it to your PHP form configuration.

## Usage

```php
use Ehyiah\QuillJsBundle\DTO\Modules\InlineToolbarModule;
use Ehyiah\QuillJsBundle\Form\QuillType;

$builder->add('content', QuillType::class, [
    'modules' => [
        new InlineToolbarModule(),
    ],
]);
```

### Choosing which buttons to display

You can configure which formatting buttons appear in the toolbar by passing the `buttons` option via the `options` array:

```php
new InlineToolbarModule(
    options: ['buttons' => ['bold', 'italic']] // Only bold and italic
);
```

Available button names: `bold`, `italic`, `underline`, `strike`, `aiAssistant`.

## Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **buttons** | `string[]` | Array of formatting buttons to display. | `['bold', 'italic', 'underline', 'strike']` |
| **autoAddAiAssistantButton** | `bool` | Automatically add the AI Assistant button when the `aiAssistant` module is also enabled. | `true` |

## Behavior

- The toolbar appears above the selected text when you select text with your mouse or keyboard.
- It displays icons for each configured formatting option.
- The icons reflect the current state of the selection (e.g., the Bold icon is highlighted if the text is already bold).
- The toolbar disappears when the selection is cleared or when you click outside it.
- If [AiAssistantModule](/guide/modules/ai-assistant) is enabled and `autoAddAiAssistantButton` is `true` (default), a star icon is appended to the toolbar. Clicking it opens the AI Assistant menu below the inline toolbar button.
- Set `autoAddAiAssistantButton` to `false` to keep full control over the `buttons` list without automatic injection.

## Try it live

Select any text in the editor below to see the floating toolbar appear.

<ClientOnly>
  <QuillPlayground
    enabled="inlineToolbar"
    placeholder="Select some text to see the floating toolbar…"
  />
</ClientOnly>

## Visual Customization

The module injects its own CSS with a clean, modern aesthetic (white background, soft shadows). You can override the styles in your own CSS using these classes:
- `.ql-inline-toolbar`: The floating bubble container.
- `.ql-inline-toolbar button`: Individual buttons.
- `.ql-inline-toolbar button.active`: Active/selected state for buttons.
