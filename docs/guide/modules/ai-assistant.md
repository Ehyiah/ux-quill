# AiAssistantModule

The AiAssistantModule adds an AI-powered writing assistant to the Quill editor. It provides seven features — reformulation, translation, grammar correction, content generation, summarization, semantic analysis, and automatic table of contents.

All features run entirely in-browser using the `@xenova/transformers` library (ONNX runtime via WebGPU/WASM). **No API key, no server, no external service** — it works out of the box.

When enabled, the module adds a "star" icon button (<svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>) to the toolbar. Clicking it opens a dropdown menu listing the enabled features.

**Note:** Machine learning models are downloaded on first use (typically 60–350 MB per model, cached by the browser after the initial download). The editor remains fully usable while models load in the background.

## Configuration

The AiAssistantModule is configured through the standard `modules` option, like all other modules:

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule;

$builder->add('content', QuillType::class, [
    'modules' => [
        new AiAssistantModule(options: [
            'features' => ['rewrite', 'translate', 'summarize'],
        ]),
    ],
]);
```

### Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **features** | `array` | List of enabled features. See the full list below. | `[]` |
| **translate** | `array` | Translation sub-options (see [Translation options](#translation-options)) | — |
| **toc** | `array` | Table of contents sub-options (see [TOC options](#toc-options)) | — |

### Available features

| Feature key | Tooltip label | Description |
| :--- | :--- | :--- |
| `'rewrite'` | Reformuler | Rewrite selected text in a different style |
| `'translate'` | Traduire | Translate selected text inline |
| `'grammar'` | Corriger la grammaire | Fix grammar and spelling mistakes |
| `'generate'` | Générer du contenu | Generate new content from a prompt (with streaming) |
| `'summarize'` | Résumer | Summarize selected text or the full document |
| `'semantic'` | Analyser le contenu | Extract keywords, topics, and reading statistics |
| `'toc'` | Générer le sommaire | Generate a table of contents from headings |

## Full example

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\QuillGroup;
use Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule;

$builder->add('content', QuillType::class, [
    'quill_options' => [
        QuillGroup::buildAdvanced(),
    ],
    'modules' => [
        new AiAssistantModule(options: [
            'features' => [
                'rewrite',
                'translate',
                'grammar',
                'generate',
                'summarize',
                'semantic',
                'toc',
            ],
            'translate' => [
                'target_languages' => ['fr', 'en', 'es', 'de', 'it'],
                'default_language' => 'fr',
            ],
            'toc' => [
                'depth' => 3,
            ],
        ]),
    ],
]);
```

---

## Rewrite

The Rewrite feature reformulates the selected text in a different style. It is useful for adjusting the tone of a paragraph without changing its meaning.

**How it works:**
1. Select the text to reformulate.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg> in the toolbar.
3. Choose **Reformuler**.
4. Select the desired style from the sub-menu.

### Available styles

| Style | Effect |
| :--- | :--- |
| **Formel** | Professional, academic tone |
| **Décontracté** | Casual, conversational tone |
| **Plus concis** | Shorter, more direct phrasing |
| **Plus développé** | Expanded, more detailed phrasing |

**Model:** `Xenova/t5-small` (text2text-generation, ~60 MB)

---

## Translate

The Translate feature translates the selected text into a target language. The original text is replaced by the translation.

**How it works:**
1. Select the text to translate.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
3. Choose **Traduire**.
4. Select the target language from the list.

### Available languages

| Code | Language |
| :--- | :--- |
| `fr` | Français |
| `en` | English |
| `es` | Español |
| `de` | Deutsch |
| `it` | Italiano |
| `pt` | Português |
| `nl` | Nederlands |
| `pl` | Polski |
| `ru` | Русский |
| `zh` | 中文 |
| `ja` | 日本語 |
| `ko` | 한국어 |
| `ar` | العربية |
| `hi` | हिन्दी |

### Translation options

| Sub-option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **target_languages** | `array` | Language codes displayed in the translator picker | `['fr', 'en', 'es', 'de', 'it', 'pt']` |
| **default_language** | `string` | Pre-selected language code | `'en'` |

**Model:** `Xenova/t5-small` used with a translation prompt (multilingual, ~60 MB)

**Usage example:**

```php
new AiAssistantModule(options: [
    'features' => ['translate'],
    'translate' => [
        'target_languages' => ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'zh'],
        'default_language' => 'fr',
    ],
]),
```

---

## Grammar

The Grammar feature analyzes the text and automatically corrects grammar and spelling mistakes. It works on the selected text, or on the entire document if no text is selected.

**How it works:**
1. (Optional) Select a specific passage, or leave empty to check the full document.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
3. Choose **Corriger la grammaire**.
4. Corrections are applied automatically inline.

**Model:** `Xenova/t5-small` used with a grammar correction prompt (~60 MB)

---

## Generate

The Generate feature creates new content from a text prompt. It is useful for writing paragraphs, lists, or short articles directly inside the editor.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Générer du contenu**.
3. A modal dialog opens. Type your prompt (e.g., "Write an introduction about AI in healthcare").
4. Press **Générer** (or `Ctrl`/`Cmd` + `Enter`).
5. The generated text streams into the editor at the cursor position. Press `Escape` to close the modal without generating.

### Keyboard shortcuts (modal)

| Key | Action |
| :--- | :--- |
| `Ctrl`/`Cmd` + `Enter` | Generate |
| `Escape` | Cancel |

**Model:** `Xenova/distilgpt2` (text-generation, ~350 MB)

---

## Summarize

The Summarize feature condenses the selected text (or the full document) into a shorter summary. Choose between a flowing paragraph or bullet points.

**How it works:**
1. (Optional) Select a specific passage to summarize. If nothing is selected, the whole document is used.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
3. Choose **Résumer**.
4. Select the output format:
   - **Paragraphe** — a flowing paragraph.
   - **Points clés** — bullet-point list.
5. The summary is inserted at the end of the document (or after the selection).

**Model:** `Xenova/t5-small` (summarization, ~60 MB)

---

## Semantic

The Semantic feature analyzes the document content and displays a modal with keyword frequency, suggested topics, word count, and estimated reading time. No text selection is required — it always works on the full document.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Analyser le contenu**.
3. A modal displays:
   - **Word count** and **estimated reading time**
   - **Suggested topics** (auto-extracted)
   - **Keyword cloud** — the most frequent words, sized by frequency
4. Click **Fermer** or anywhere outside the modal to close it.

**Note:** This feature uses local word-frequency analysis (TF-IDF) — no model is downloaded. It works instantly on documents of any size.

---

## TOC

The Table of Contents feature scans the editor's headings (`<h1>` through `<h6>`) and generates a bullet-point list of all headings, respecting the heading hierarchy. The list is inserted at the beginning of the document.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Générer le sommaire**.
3. A bullet-point list of all headings (respecting the configured depth) is inserted at position `0`.

**Note:** This feature works purely on DOM extraction — no model is downloaded. If the document has no headings, nothing is inserted.

### TOC options

| Sub-option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **depth** | `int` | Maximum heading level to include (e.g., `3` = h1, h2, h3) | `3` |

**Usage example:**

```php
new AiAssistantModule(options: [
    'features' => ['toc'],
    'toc' => [
        'depth' => 2, // only h1 and h2
    ],
]),
```

## Try it live

<ClientOnly>
  <QuillPlayground
    enabled="aiAssistant"
    placeholder="Write something and try the AI Assistant button in the toolbar…"
  />
</ClientOnly>

> **Note:** The first time you use a feature, the browser will download the corresponding machine-learning model (60–350 MB, cached afterwards). The editor remains usable while the model loads.
