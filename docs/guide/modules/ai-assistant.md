# AiAssistantModule

The AiAssistantModule adds an AI-powered writing assistant to the Quill editor. It provides seven features — reformulation, translation, grammar correction, content generation, summarization, semantic analysis, and automatic table of contents.

## Provider options

The module supports two providers:

| Provider | Type | Description |
| :--- | :--- | :--- |
| **`api`** (recommended) | Backend proxy | Routes all AI requests through a PHP controller (`/_ux/quill/ai-assistant`) which calls an OpenAI-compatible API. API keys stay server-side (environment variables). |
| **`transformers`** | Local browser (dormant) | Runs models entirely in-browser via `@huggingface/transformers` (ONNX runtime). Models are large (60–350 MB each) and quality is limited. No API key needed. |

The recommended provider is `api` — configure your AI backend via environment variables (see [API configuration](#api-provider-configuration)).

When enabled, the module adds a "star" icon button (<svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>) to the toolbar. Clicking it opens a dropdown menu listing the enabled features.

## Configuration

The AiAssistantModule is configured through the standard `modules` option, like all other modules:

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\AiAssistantModule;

$builder->add('content', QuillType::class, [
    'modules' => [
        new AiAssistantModule(options: [
            'provider' => 'api',
            'features' => ['rewrite', 'translate', 'summarize'],
        ]),
    ],
]);
```

### Options

| Option | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **provider** | `string` | Provider to use: `'api'` or `'transformers'` | `'transformers'` |
| **features** | `array` | List of enabled features. See the full list below. | `[]` |
| **models** | `array` | Per-task model overrides (see [Per-task models](#per-task-models)) | `[]` |
| **reasoning** | `bool` | Allow the model to show chain-of-thought reasoning. Set to `false` for models like Qwen that output long reasoning before the answer. | `true` |
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

## API provider configuration

When using `provider: 'api'`, the module sends requests to a backend PHP controller (`/_ux/quill/ai-assistant`), which forwards them to an OpenAI-compatible API. Configure the connection via environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `QUILL_AI_API_URL` | API endpoint URL | `https://api.openai.com/v1/chat/completions` |
| `QUILL_AI_API_KEY` | API key (optional — omit for Ollama, LLM Studio) | — |
| `QUILL_AI_MODEL` | Default model name | `gpt-4o-mini` |
| `QUILL_AI_MAX_TOKENS` | Maximum tokens per response | `4096` |
| `QUILL_AI_TEMPERATURE` | Generation temperature | `0.7` |
| `QUILL_AI_TIMEOUT` | Curl timeout in seconds | `120` |

> **Security note:** API keys are never exposed to the frontend. If `apiKey` or `api_key` is set in the module options, the PHP DTO throws an `InvalidArgumentException`. Always use environment variables.

> **Unauthenticated endpoints:** When `QUILL_AI_API_KEY` is not set, the controller sends no `Authorization` header. This works with local endpoints like Ollama and LLM Studio.

### Per-task models

You can configure a different model for each task via the `models` option:

```php
new AiAssistantModule(options: [
    'provider' => 'api',
    'features' => ['rewrite', 'translate', 'generate'],
    'models' => [
        'translate' => 'gpt-4o-mini',
        'rewrite' => 'gpt-4o',
        'generate' => 'gpt-4o',
    ],
]),
```

If a task has no model override, the default model (`QUILL_AI_MODEL`) is used.

## Routing

The AI Assistant backend controller is registered as a service automatically, but its route needs to be imported in your Symfony application. Create a file `config/routes/ux_quill.yaml` (or add to an existing one) with the following content:

```yaml
# config/routes/ux_quill.yaml
ux_quill_ai_assistant:
    resource: '@QuillJsBundle/Resources/config/routes/ai_assistant.xml'
```

This imports the route `/_ux/quill/ai-assistant` (POST) which the JavaScript `ApiProvider` calls for all AI features.

### Full example with API provider

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
            'provider' => 'api',
            'reasoning' => false,
            'features' => [
                'rewrite',
                'translate',
                'grammar',
                'generate',
                'summarize',
                'semantic',
                'toc',
            ],
            'models' => [
                'translate' => 'gpt-4o-mini',
                'rewrite' => 'gpt-4o',
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
    content='<h2>AI Writing Assistant Demo</h2><p>Welcome to the AI Assistant playground! <strong>Click the &#x2728; button</strong> in the toolbar and choose an action to test it on this text.</p><ul><li><strong>Rewrite</strong> &mdash; Select this sentence and try rewriting it in a different style.</li><li><strong>Translate</strong> &mdash; &ldquo;Bonjour, comment allez-vous aujourd&#x2019;hui ? J&#x2019;esp&egrave;re que tout va bien.&rdquo;</li><li><strong>Grammar</strong> &mdash; &ldquo;He go to school yesterday and she don&#x2019;t know what to do about there car.&rdquo;</li><li><strong>Summarize</strong> &mdash; Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals and humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.</li></ul><p><em>Tip: Select text above, then click the &#x2728; button. Or type your own content below!</em></p>'
  />
</ClientOnly>
