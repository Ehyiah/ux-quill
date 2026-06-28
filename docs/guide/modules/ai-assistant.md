---
outline: [1, 3]
---

# AiAssistantModule

The AiAssistantModule adds an AI-powered writing assistant to the Quill editor.
It provides seven features at the moment
— reformulation, translation, grammar correction, content generation, summarization, semantic analysis, and automatic table of contents generation.

1. Choose a provider (see [Choose a provider](#choose-a-provider))
2. Configure the module with it (see [Module configuration](#module-configuration))
3. Configure the choosen provider

# Choose a provider

The module currently supports three types of providers:

| Provider | Type | Description |
| :--- | :--- | :--- |
| **`api`** (recommended) | Backend proxy | Routes all AI requests through a PHP controller (`/_ux/quill/ai-assistant`) which calls an OpenAI-compatible API. API keys stay server-side (environment variables). |
| **`wllama`** | Local browser (GGUF) | Runs models entirely in-browser via `@wllama/wllama` (llama.cpp WASM). Supports 160K+ GGUF models from HuggingFace. No API key needed. Default model: `Qwen/Qwen2.5-0.5B-Instruct-GGUF` (~350 MB Q4). |
| **`transformers`** | Local browser (ONNX) | Runs models entirely in-browser via `@huggingface/transformers` (ONNX runtime). Models are large (60–350 MB each) and quality of responses is very limited. No API key needed. |

::: info
The recommended provider is `api`, so you can have the better responses possible and call any LLM (chatGPT, claude, gemini or self-hosted)
— configure your AI backend via environment variables (see [API configuration](#api-provider-configuration)).
:::

::: tip
Provider **`wllama`** is a great option for fully offline usage. It runs llama.cpp compiled to WebAssembly in any browser (no WebGPU required) and supports instruction-tuned GGUF models. See [Wllama provider configuration](#wllama-provider-configuration) for setup and recommended models.
:::

::: warning
Providers **`transformers`** and **`wllama`** are not recommended or for testing purpose only, because the quality of responses is quite poor, and will depend on the user computer power.
:::


When enabled, the module adds a "star" icon button to the toolbar. Clicking it opens a dropdown menu listing the enabled features.

# Module configuration

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
| **provider** | `string` | Provider to use: `'api'`, `'wllama'`, or `'transformers'` | `'transformers'` |
| **features** | `array` | List of enabled features. See the full list below. | `[]` |
| **models** | `array` | Per-task model overrides (see [Per-task models](#per-task-models)) | `[]` |
| **reasoning** | `bool` | Allow the model to show chain-of-thought reasoning. Set to `false` for models like Qwen that output long reasoning before the answer. | `true` |
| **temperature** | `float` | Generation temperature (0.0 = deterministic, 1.0 = creative). Applies to all features across all providers. | `0.7` |
| **translate** | `array` | Translation sub-options (see [Translation options](#translation-options)) | — |
| **toc** | `array` | Table of contents sub-options (see [TOC options](#toc-options)) | — |

### Available features

| Feature key | Tooltip label | Description |
| :--- | :--- | :--- |
| `'rewrite'` | Reformuler | Rewrite selected text in a different style |
| `'translate'` | Traduire | Translate selected text inline |
| `'grammar'` | Corriger la grammaire | Fix grammar and spelling mistakes |
| `'generate'` | Generate content | Generate new content from a prompt (with streaming) |
| `'summarize'` | Summarize | Summarize selected text or the full document |
| `'semantic'` | Analyser le contenu | Extract keywords, topics, and reading statistics |
| `'toc'` | Generate TOC | Generate a table of contents from headings |

# Providers configuration

## API provider configuration

### Routing

The AI Assistant backend controller is registered as a service automatically, but its route needs to be imported in your Symfony application. Create a file `config/routes/ux_quill.yaml` (or add to an existing one) with the following content:


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

::: warning
You need to configure the route in order to use `api` providers.
:::

```yaml
# config/routes/ux_quill.yaml
ux_quill_ai_assistant:
    resource: '@QuillJsBundle/Resources/config/routes/ai_assistant.xml'
```

This imports the route `/_ux/quill/ai-assistant` (POST) which the JavaScript `ApiProvider` calls for all AI features.

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

## Wllama provider configuration

Provider `wllama` runs GGUF models entirely in-browser using [@wllama/wllama](https://github.com/ngxson/wllama) (llama.cpp compiled to WebAssembly).
It works in all modern browsers without WebGPU.

### Installation

::: warning
There is a problem with the package.json in wllama vendor. So you need to require it manually on your project, because AssetMapper can not find the correct main file.
:::

The consuming app must install `@wllama/wllama`:

```bash
# With npm/yarn (Webpack Encore)
yarn add @wllama/wllama

# With Symfony importmap (use the explicit CDN path)
bin/console importmap:require @wllama/wllama/esm/index.js
```

### How it works

1. On first feature use, the provider downloads the GGUF model from HuggingFace (default: `Qwen/Qwen2.5-0.5B-Instruct-GGUF`, q4_k_m — ~350 MB).
2. Download progress is shown in the loading overlay.
3. All 7 features use `createChatCompletion()` with system/user messages.

### GPU acceleration (WebGPU)

Wllama automatically detects and uses **WebGPU** when available in the browser, which significantly speeds up inference. No configuration is needed — if your browser and GPU support WebGPU, it is enabled by default.

- **Supported browsers:** Chrome 113+, Edge 113+, Opera 99+ (Firefox and Safari have partial/experimental support)
- **How it works:** On startup, wllama checks `navigator.gpu`. If available, model layers are offloaded to the GPU automatically
- **VRAM limits:** If the model is too large for your GPU's VRAM, wllama falls back to CPU automatically. No manual tuning is required

::: tip
WebGPU provides **2–5x faster inference** compared to CPU-only WASM. If you target modern browsers, wllama will use it transparently.
:::

### Custom model

You can override the default model by setting the `translate` model (the provider uses this as its single model config — all features share the same loaded model):

```php
new AiAssistantModule(options: [
    'provider' => 'wllama',
    'models' => [
        'translate' => 'Qwen/Qwen2.5-1.5B-Instruct-GGUF/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    ],
]),
```

The `models.translate` value uses the format `HUGGINGFACE_REPO/FILENAME.gguf`. The model is downloaded once from HuggingFace Hub on first feature use, then cached in the browser.

### How to find GGUF models on HuggingFace

1. Go to [huggingface.co/models](https://huggingface.co/models)
2. Search for a model name and filter by tag **`gguf`**
3. Browse the **Files** tab of a model repository to see available `.gguf` files

**Example — finding Qwen2.5 models:**
1. Search `Qwen2.5-Instruct` on [huggingface.co/models](https://huggingface.co/models)
2. Click on a repo like [Qwen/Qwen2.5-1.5B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF)
3. Go to the **Files and versions** tab
4. Pick a `.gguf` file (see quantization guide below)

The config value is then: `HUGGINGFACE_REPO/FILENAME`, e.g.:
```
Qwen/Qwen2.5-1.5B-Instruct-GGUF/qwen2.5-1.5b-instruct-q4_k_m.gguf
```

### Understanding quantization (GGUF file names)

GGUF files are named with their quantization method, which determines the trade-off between **file size**, **RAM usage**, and **quality**:

| Quantization | Quality | Size | Best for |
| :--- | :--- | :--- | :--- |
| `Q2_K` | ★★☆☆☆ | Smallest | Very constrained devices |
| `Q3_K_M` | ★★★☆☆ | Small | Low-memory devices |
| `Q4_K_M` | ★★★★☆ | Medium | **Recommended** — best balance |
| `Q5_K_M` | ★★★★★ | Medium-large | Quality-focused setups |
| `Q6_K` | ★★★★★ | Large | Near-lossless |
| `Q8_0` | ★★★★★ | Largest | Maximum quality (rarely needed) |

**Rule of thumb:** Choose `Q4_K_M` unless you have a specific reason not to. It gives the best balance of quality, file size, and RAM usage.

### Single model for all features

::: info
The wllama provider loads **one model** in the browser and reuses it for all features (rewrite, translate, grammar, etc.). This is by design — loading a GGUF model involves a multi-hundred-MB download and significant memory, so switching models per-feature is not practical.
:::

### Recommended GGUF models

| Model | Repo / File pattern | Size (Q4) | RAM | Quality | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qwen2.5-0.5B-Instruct** | `Qwen/Qwen2.5-0.5B-Instruct-GGUF` | ~350 MB | 512 MB | ★★★★☆ | Best quality/size ratio, recommended default |
| **SmolLM2-360M-Instruct** | `HuggingFaceTB/SmolLM2-360M-Instruct-GGUF` | ~250 MB | 384 MB | ★★★☆☆ | Very lightweight, good for simple translations |
| **TinyLlama-1.1B-Chat** | `TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF` | ~700 MB | 1 GB | ★★★★☆ | Good general-purpose model |
| **Llama-3.2-1B-Instruct** | `bartowski/Llama-3.2-1B-Instruct-GGUF` | ~700 MB | 1 GB | ★★★★☆ | Excellent instruction following |
| **Qwen2.5-1.5B-Instruct** | `Qwen/Qwen2.5-1.5B-Instruct-GGUF` | ~900 MB | 1.5 GB | ★★★★★ | Best quality under 2 GB |
| **SmolLM2-1.7B-Instruct** | `HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF` | ~1 GB | 1.5 GB | ★★★★☆ | Good mid-range option |
| **Gemma-2-2B-it** | `bartowski/Gemma-2-2B-it-GGUF` | ~1.3 GB | 2 GB | ★★★★★ | Best quality, heavier |
| **Phi-3-mini-4k-instruct** | `bartowski/Phi-3-mini-4k-instruct-GGUF` | ~2 GB | 3 GB | ★★★★★ | Powerful but needs more RAM |
| **Zephyr-3B** | `TheBloke/zephyr-3B-beta-GGUF` | ~1.8 GB | 3 GB | ★★★★☆ | Good compromise |

::: tip
Browse more GGUF models on HuggingFace: [huggingface.co/models?library=gguf](https://huggingface.co/models?library=gguf)
:::

## Transformers provider configuration

Provider `transformers` runs ONNX models entirely in-browser using [@huggingface/transformers](https://github.com/huggingface/transformers.js). Models are downloaded from HuggingFace Hub on first use and cached in the browser.

### How it works

1. On first feature use, the provider downloads the ONNX model from HuggingFace.
2. Download progress is shown in the loading overlay.
3. Models are cached in the browser's CacheStorage for offline use.
4. The `semantic` and `toc` features use local analysis (no model download).

### Default models

The following ONNX models are used per feature:

| Feature | Model | Task | Size |
| :--- | :--- | :--- | :--- |
| **rewrite** | `Xenova/LaMini-Flan-T5-783M` | text2text-generation | ~800 MB |
| **translate** | `Xenova/LaMini-Flan-T5-783M` | text2text-generation | ~800 MB |
| **grammar** | `Xenova/LaMini-Flan-T5-783M` | text2text-generation | ~800 MB |
| **summarize** | `Xenova/LaMini-Flan-T5-783M` | summarization | ~800 MB |
| **generate** | `Xenova/distilgpt2` | text-generation | ~250 MB |
| **semantic** | *(none)* | Local TF-IDF analysis | — |
| **toc** | *(none)* | DOM heading extraction | — |

::: info
Several features share the same model (`Xenova/LaMini-Flan-T5-783M`), so it is downloaded only once. The total download for all features is approximately **1 GB**.
:::

### How to find ONNX models on HuggingFace

1. Go to [huggingface.co/models](https://huggingface.co/models)
2. Filter by tag **`onnx`** and a task tag (e.g., `text-generation`, `summarization`, `text2text-generation`)
3. Models exported by the HuggingFace community (especially from the `Xenova` namespace) are pre-optimized for browser use via `@huggingface/transformers`

::: tip
Browse ONNX models on HuggingFace: [huggingface.co/models?library=onnx](https://huggingface.co/models?library=onnx)
:::

### Limitations

::: warning
The transformers provider is **not recommended for production use**:
- Models are small and produce lower quality responses compared to `api` or even `wllama`
- Large model downloads (~1 GB) on first use can be slow
- Inference depends on the user's device CPU power
:::

Currently, models are hardcoded in the provider and cannot be configured via the `models` option. For customizable models, use the [`wllama` provider](#wllama-provider-configuration) or the [`api` provider](#api-provider-configuration).

::: tip
For most use cases, the `api` provider (recommended) or `wllama` provider will give better results. The `transformers` provider is primarily intended for development and testing.
:::


---

# Available features

## Rewrite

The Rewrite feature reformulates the selected text in a different style. It is useful for adjusting the tone of a paragraph without changing its meaning.

**How it works:**
1. Select the text to reformulate.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg> in the toolbar.
3. Choose **Reformulate**.
4. Select the desired style from the sub-menu.

### Available styles

| Style | Effect |
| :--- | :--- |
| **Formal** | Professional, academic tone |
| **Casual** | Casual, conversational tone |
| **More concise** | Shorter, more direct phrasing |
| **More detailed** | Expanded, more detailed phrasing |

---

## Translate

The Translate feature translates the selected text into a target language. The original text is replaced by the translation.

**How it works:**
1. Select the text to translate.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
3. Choose **Translate**.
4. Select the target language from the list.

### Available languages

| Code | Language |
| :--- | :--- |
| `fr` | French |
| `en` | English |
| `es` | Español |
| `de` | Deutsch |
| `it` | Italiano |
| `pt` | Portuguese |
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
3. Choose **Correct grammar**.
4. Corrections are applied automatically inline.

---

## Generate

The Generate feature creates new content from a text prompt. It is useful for writing paragraphs, lists, or short articles directly inside the editor.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Generate content**.
3. A modal dialog opens. Type your prompt (e.g., "Write an introduction about AI in healthcare").
4. Press **Generate** (or `Ctrl`/`Cmd` + `Enter`).
5. The generated text streams into the editor at the cursor position. Press `Escape` to close the modal without generating.

### Keyboard shortcuts (modal)

| Key | Action |
| :--- | :--- |
| `Ctrl`/`Cmd` + `Enter` | Generate |
| `Escape` | Cancel |

---

## Summarize

The Summarize feature condenses your content into a shorter version. By default it works on the **entire document** — if you only want to summarize a specific passage, select it first.

**How it works:**
1. Leave **no text selected** to summarize the full document, or select a specific passage.
2. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
3. Choose **Summarize**.
4. Select the output format:
   - **Paragraphe** — a flowing paragraph summary.
   - **Key points** — bullet-point list of main ideas.
5. The summary is inserted after the selection, or at the end of the document if nothing was selected.

---

## Semantic

The Semantic feature analyzes the document content and displays a modal with keyword frequency, suggested topics, word count, and estimated reading time. No text selection is required — it always works on the full document.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Analyze content**.
3. A modal displays:
   - **Word count** and **estimated reading time**
   - **Suggested topics** (auto-extracted)
   - **Keyword cloud** — the most frequent words, sized by frequency
4. Click **Close** or anywhere outside the modal to close it.

**Note:** This feature uses local word-frequency analysis (TF-IDF) — no model is downloaded. It works instantly on documents of any size.

---

## Table of contents

The Table of Contents feature scans the editor's headings (`<h1>` through `<h6>`) and generates a bullet-point list of all headings, respecting the heading hierarchy. The list is inserted at the beginning of the document.

**How it works:**
1. Click the AI Assistant button <svg viewBox="0 0 18 18" width="14" height="14"><path d="M9 2 L11 7 L16 7 L12 10.5 L13.5 16 L9 12.5 L4.5 16 L6 10.5 L2 7 L7 7 Z" fill="currentColor"/></svg>.
2. Choose **Generate TOC**.
3. A bullet-point list of all headings (respecting the configured depth) is inserted at position `0`.

**Note:** This feature works purely on DOM extraction — no model is downloaded. If the document has no headings, nothing is inserted.

### options

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

# Try it live

<ClientOnly>
  <QuillPlayground
    enabled="aiAssistant"
    placeholder="Write something and try the AI Assistant button in the toolbar…"
    content='<h2>AI Writing Assistant Demo</h2><p>Welcome to the AI Assistant playground! <strong>Click the &#x2728; button</strong> in the toolbar and choose an action to test it on this text.</p><ul><li><strong>Rewrite</strong> &mdash; Select this sentence and try rewriting it in a different style.</li><li><strong>Translate</strong> &mdash; &ldquo;Bonjour, comment allez-vous aujourd&#x2019;hui ? J&#x2019;esp&egrave;re que tout va bien.&rdquo;</li><li><strong>Grammar</strong> &mdash; &ldquo;He go to school yesterday and she don&#x2019;t know what to do about there car.&rdquo;</li><li><strong>Summarize</strong> &mdash; Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals and humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.</li></ul><p><em>Tip: Select text above, then click the &#x2728; button. Or type your own content below!</em></p>'
  />
</ClientOnly>
