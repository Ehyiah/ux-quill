# Live Playground

Try all the features of Symfony UX Quill in this interactive editor.

<ClientOnly>
  <QuillPlayground />
</ClientOnly>

## Active modules

| Feature | Toolbar / Module | Options passed in the playground |
|---------|-----------------|----------------------------------|
| **Headers** | `header` | `[1, 2, 3, 4, 5, 6, false]` |
| **Bold, Italic, Underline, Strike** | `bold`, `italic`, `underline`, `strike` | — |
| **Lists** (ordered, bullet, check) | `list` | `ordered`, `bullet`, `check` |
| **Indent** | `indent` | `-1`, `+1` |
| **Alignment** | `align` | `[]` (all directions) |
| **Blockquote** | `blockquote` | — |
| **Code Block** | `code-block` | — |
| **Syntax Highlighting** | `syntax` (module) | `true` |
| **Formula** | `formula` | — |
| **Subscript / Superscript** | `script` | `sub`, `super` |
| **Text Color** | `color` | `[]` (all colors) |
| **Background Color** | `background` | `[]` (all colors) |
| **Clean formatting** | `clean` | — |
| **Link** | `link` | — |
| **Image** | `image` | — |
| **Video** | `video` | — |
| **Table** | `table-better` (module) | `{ toolbarTable: true }` |
| **Emoji** | `emoji` (module: `emoji-toolbar`) | `{}` |
| **Divider** | `divider` (module) | `{}` |
| **Page Break** | `pageBreak` (module) | `{}` |
| **Image Gallery** | `imageGallery` (module) | `{ listEndpoint, searchEndpoint, uploadEndpoint, messages }` |
| **Image Selection** | `imageSelection` (module) | `{}` |
| **Video Selection** | `videoSelection` (module) | `{}` |
| **Fullscreen** | `toggleFullscreen` (module) | `{}` |
| **HTML Edit** | `htmlEditButton` (module) | `{}` |
| **Mention** | `mention` (module) | `{ trigger: '@', data: 6 users }` available autocomplete choices : Alice Johnson, Bob Smith, Charlie Brown, Diana Prince, Eve Wilson, Frank Castle  |
| **Smart Links** | `smartLinks` (module) | `{ linkRegex: '/https?:\\\\/\\\\/[^\\\\s]+/' }` |
| **Link Attributes** | `linkAttributes` (module) | `{}` |
| **Autosave** | `autosave` (module) | `{ key: 'playground-demo', interval: 30000 }` |
| **Counter** | `counter` (module) | `{ words: true, words_container: 'playground-counter' }` |
| **Reading Time** | `readingTime` (module) | `{ target: '#playground-reading-time', wpm: 200 }` |
| **Node Mover** | `nodeMover` (module) | `{borderColor: null, dropIndicatorColor: '#ff0000', duplicate: true}` |
| **Paste Sanitizer** | `pasteSanitizer` (module) | `{ plainText: false }` |
| **Speech To Text** | `speechToText` (module) | `{ language: 'en-US' }` |
| **Markdown** | `markdown` (module) | `true` |
