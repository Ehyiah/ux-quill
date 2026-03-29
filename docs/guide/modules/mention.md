# MentionModule

**Auto-imported: NO** (requires manual addition to the `modules` option)

This module allows you to trigger suggestions when typing a specific character (like `@` or `#`). It supports both static data and remote data fetching via AJAX.

### Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **trigger** | `string` | The character that triggers the suggestion list. | `'@'` |
| **data** | `array` | A static list of items. Each item must be an object: `{'id': 1, 'value': 'Name'}`. | `[]` |
| **remote_url** | `string` | URL for AJAX search. Use `{query}` as a placeholder for the user input. | `null` |
| **min_chars** | `int` | Minimum characters to type after the trigger before showing suggestions. | `1` |
| **max_results** | `int` | Maximum number of results displayed in the suggestion list. | `10` |

### Behavior

- **Triggering**: The list appears when the `trigger` character is followed by at least `min_chars` characters (without spaces).
- **Navigation**:
    - `ArrowUp` / `ArrowDown`: Move selection in the list.
    - `Enter` / `Tab`: Select the current item.
    - `Escape`: Close the suggestion list.
- **Insertion**: When selected, the trigger and the typed query are replaced by a **Mention Blot** (a styled `<span>`).

### Remote Search (AJAX)

When using `remote_url`, your API must return a JSON array of objects with at least `id` and `value` properties:

```json
[
  { "id": "user-1", "value": "John Doe" },
  { "id": "user-2", "value": "Jane Smith" }
]
```

Example URL configuration: `https://api.example.com/users?search={query}`

### Usage Examples

**1. Basic usage with static data:**

```php
'modules' => [
    new MentionModule(options: [
        'trigger' => '@',
        'data' => [
            ['id' => 1, 'value' => 'Matthieu'],
            ['id' => 2, 'value' => 'Gemini'],
            ['id' => 3, 'value' => 'Symfony'],
        ],
    ]),
],
```

**2. Advanced usage with remote search (e.g., Tags):**

```php
'modules' => [
    new MentionModule(options: [
        'trigger' => '#',
        'remote_url' => '/api/tags/search?q={query}',
        'min_chars' => 2,
        'max_results' => 5,
    ]),
],
```

**3. Multiple triggers:**

If you need multiple triggers (e.g., `@` for users AND `#` for tags), you can pass multiple instances. **Make sure each one has a unique `name` starting with `mention-`**:

```php
'modules' => [
    new MentionModule(name: 'mention-users', options: [
        'trigger' => '@',
        'remote_url' => '/api/users/search?q={query}',
    ]),
    new MentionModule(name: 'mention-tags', options: [
        'trigger' => '#',
        'data' => [
            ['id' => 'tech', 'value' => 'technology'],
            ['id' => 'news', 'value' => 'news'],
        ],
    ]),
],
```

### Customizing the look

The mentions and the suggestion list can be styled using CSS. Here are the default classes:
- `.ql-mention`: The inserted mention in the editor.
- `.ql-mention-list`: The floating suggestion container.
- `.ql-mention-item`: An item in the list.
- `.ql-mention-item.selected`: The currently highlighted item.

Example to customize the mention color:
```css
.ql-editor .ql-mention {
    background-color: #fce4ec;
    color: #c2185b;
}
```
