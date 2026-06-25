---
outline: [1, 5]
---

# Synonym Module

The Synonym module allows users to find and replace words with synonyms directly from the Quill editor.

## Architecture

Instead of hardcoding API providers in JavaScript, this module delegates all synonym lookups to a **server-side provider**. The frontend sends the selected word (and optional context) to a Symfony endpoint, which delegates the request to a registered `SynonymProviderInterface` implementation.

```
┌──────────────┐   POST /_ux/quill/synonyms     ┌──────────────────┐
│  Quill Editor│  ──────────────────────────►   │ SynonymController│
│  (JavaScript)│                                │      (PHP)       │
│              │  ◄──────────────────────────── │    (built-in)    │
│              │    JSON [{word, score}]        └────────┬─────────┘
└──────────────┘                                         │
                                                  ┌──────▼──────┐
                                                  │  Provider   │
                                                  │  Registry   │
                                                  └──────┬──────┘
                                                  ┌──────▼──────┐
                                                  │  MyProvider │
                                                  │  (interface)│
                                                  └─────────────┘
```

---

# Using the module

In order to use this module you need to :
1. Add the module in your Quill form Type and choose a provider.
2. Choose one of the built-in providers (or create your custom provider) and pass it to the module as an option.
3. Add the back-end route in your application.

```php
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;

// Basic usage
new SynonymModule(
    options: [
        SynonymModule::PROVIDER_OPTION => App\Quill\MySynonymProvider::class,
    ],
);

// With provider options (non-sensitive config)
// each provider has differents available options depending on its API see providers detailed doc
new SynonymModule(
    options: [
        SynonymModule::PROVIDER_OPTION => App\Quill\MySynonymProvider::class,
        SynonymModule::PROVIDER_OPTIONS => [
            'maxResults' => 5,
            'timeout' => 30,
        ],
    ],
);

// With module custom options but withouth provider options
new SynonymModule(
    options: [
        SynonymModule::PROVIDER_OPTION => App\Quill\MySynonymProvider::class,
        'locale' => 'en',
        'icon' => '<svg>...</svg>',
        'headerText' => 'Synonyms for',
        'noSynonymText' => 'No synonyms found for : {word}',
    ],
);
```

## Module options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `string` | — | FQCN of the synonym provider |
| `providerOptions` | `array` | `[]` | Per-form provider config overrides (non-sensitive options only) |
| `locale` | `string` | `'en'` | Locale for the synonym search |
| `icon` | `string\|HTMLElement` | `'🔄'` | Icon for the toolbar button |
| `headerText` | `string` | `'Look for synonyms'` | Popup header text |
| `noSynonymText` | `string` | `'No Results for : {word}'` | Text shown when no synonyms are found |
| `showScore` | `bool` | `false` | Show relevance score badge (useful with AI providers like `OpenAiSynonymProvider`) |
| `debug` | `bool` | `false` | Enable console debug logs |

## Configuring provider options

Provider configuration works at two levels:

1. **Sensitive options** (API keys): set via environment variables — never sent to the client
2. **Non-sensitive options** (`maxResults`, `timeout`, `model`, etc.): configurable per-form via `providerOptions`

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\OpenAiSynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => OpenAiSynonymProvider::class,
            SynonymModule::PROVIDER_OPTIONS => [
                'maxResults' => 5,
                'model' => 'gpt-4o',
            ],
        ]),
    ],
]);
```

These options are merged with the defaults from environment variables. Sensitive options (`apiKey`) can only be set via environment variables and cannot be overridden through `providerOptions`.


## Routing

Import the bundle's routes in your application:

```yaml
# config/routes/ux_quill.yaml
ux_quill_synonyms:
    resource: '@QuillJsBundle/Resources/config/routes/synonym.xml'
```

---

# Built-in providers

Each provider accepts a **Config DTO** as its single constructor argument. Config DTOs expose all available options as typed public readonly properties — visible directly in your IDE via autocompletion.

| Provider | Key | Free | Multi-lang | Score |
|----------|-----|------|------------|-------|
| `OpenAiSynonymProvider` | Yes (OpenAI) | No | Yes | Yes |
| `DummySynonymProvider` | No | Yes | Static | Static |
| `FreeDictionarySynonymProvider` | No | Yes | Yes | No |
| `DatamuseSynonymProvider` | No | Yes | EN mainly | Yes |
| `BabelNetSynonymProvider` | Yes (free tier) | Yes | Yes | No |
| `WordsApiSynonymProvider` | Yes (RapidAPI) | No | EN | No |
| `ConceptNetSynonymProvider` | No | Yes | Yes | No |

## DummySynonymProvider

Returns static synonyms for testing. No API key or HTTP calls needed.

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\DummySynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => DummySynonymProvider::class,
        ]),
    ],
]);
```

## OpenAiSynonymProvider

Uses OpenAI (GPT-4o-mini) to find contextual synonyms.
The API key stays server-side. Supports custom model and endpoint (Azure, LocalAI, etc.).

#### Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `QUILL_OPENAI_API_KEY` | Yes | — |
| `QUILL_OPENAI_MODEL` | No | `gpt-4o-mini` |
| `QUILL_OPENAI_MAX_RESULTS` | No | `10` |
| `QUILL_OPENAI_API_URL` | No | `https://api.openai.com/v1/chat/completions` |

#### Options

| Option | Default | Description |
|--------|---------|-------------|
| `model` | `gpt-4o-mini` | Model name |
| `maxResults` | `10` | Max synonyms per request |
| `apiUrl` | `https://api.openai.com/v1/chat/completions` | API endpoint |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => OpenAiSynonymProvider::class,
            SynonymModule::PROVIDER_OPTIONS => [
                'model' => 'gpt-4o',
                'maxResults' => 5,
            ],
        ]),
    ],
]);
```

## FreeDictionarySynonymProvider

Uses the [Free Dictionary API](https://dictionaryapi.dev/) to find synonyms. Free, no API key, supports many languages.

| Option | Default | Description |
|--------|---------|-------------|
| `timeout` | `15` | HTTP timeout in seconds |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => FreeDictionarySynonymProvider::class,
        ]),
    ],
]);
```

## DatamuseSynonymProvider

Uses the [Datamuse](https://www.datamuse.com/api/) API to find synonyms. Includes relevance scoring. Primarily English.

| Option | Default | Description |
|--------|---------|-------------|
| `maxResults` | `20` | Max results per request |
| `timeout` | `15` | HTTP timeout in seconds |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => DatamuseSynonymProvider::class,
            SynonymModule::PROVIDER_OPTIONS => [
                'maxResults' => 10,
            ],
        ]),
    ],
]);
```

## BabelNetSynonymProvider

Uses the [BabelNet](https://babelnet.org/) API (v9) to find synonyms. Requires a free API key (1000 requests/day limit).

#### Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `QUILL_BABELNET_API_KEY` | Yes | — |

#### Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxSynsets` | `3` | Max synsets to query |
| `timeout` | `15` | HTTP timeout in seconds |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => BabelNetSynonymProvider::class,
            SynonymModule::PROVIDER_OPTIONS => [
                'maxSynsets' => 5,
            ],
        ]),
    ],
]);
```

## WordsApiSynonymProvider

Uses the [WordsAPI](https://www.wordsapi.com/) via RapidAPI. Requires a RapidAPI key. Primarily English.

#### Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `QUILL_WORDSAPI_API_KEY` | Yes | — |

#### Options

| Option | Default | Description |
|--------|---------|-------------|
| `apiHost` | `wordsapiv1.p.rapidapi.com` | RapidAPI host |
| `timeout` | `15` | HTTP timeout in seconds |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => WordsApiSynonymProvider::class,
        ]),
    ],
]);
```

## ConceptNetSynonymProvider (Api are currently down, will be removed if Api is permanently unavailable)

Uses the [ConceptNet](http://conceptnet.io) API to find synonyms. Free, no API key required, supports many languages.

| Option | Default | Description |
|--------|---------|-------------|
| `maxResults` | `20` | Max results per request |
| `timeout` | `15` | HTTP timeout in seconds |

```php
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => ConceptNetSynonymProvider::class,
            SynonymModule::PROVIDER_OPTIONS => [
                'maxResults' => 5,
            ],
        ]),
    ],
]);
```


# Creating a custom provider

## Create a provider class

Implement the `SynonymProviderInterface`:

```php
use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use RuntimeException;

class MySynonymProvider implements SynonymProviderInterface
{
    private array $runtimeOptions = [];

    public function configureOptions(array $options): void
    {
        $this->runtimeOptions = $options;
    }

    /**
     * @return Synonym[]
     */
    public function getSynonyms(
        string $word,
        ?string $context = null,
        string $locale = 'fr',
    ): array {
        // Your custom logic here
        // Access per-form options via $this->runtimeOptions
        return [
            new Synonym('essentiel', 0.95),
            new Synonym('crucial', 0.85),
        ];
    }

    public function validate(): void
    {
        // Throw a RuntimeException if the provider is not properly configured
        // (e.g. missing API key, invalid credentials, etc.)
    }
}
```

## Registering the provider

All built-in providers are **automatically registered and tagged** by the bundle — no YAML configuration needed.

For custom providers, simply implement `SynonymProviderInterface` and your service will be **auto-tagged** with `ux_quill.synonym_provider` (autoconfigure must be enabled, which is the default in Symfony).

## Validation

The `SynonymProviderInterface` defines a `validate(): void` method that checks whether the provider is properly configured before it is called.

Providers that require configuration (e.g. an API key) should throw a `RuntimeException` from this method:

```php
public function validate(): void
{
    if ('' === $this->config->apiKey) {
        throw new RuntimeException('MyProvider requires an API key.');
    }
}
```

The `SynonymController` automatically calls `validate()` before `getSynonyms()`. If validation fails, the endpoint returns a `400 Bad Request` response with the error message — no actual API call is made.

Providers without prerequisites (`DummySynonymProvider`, `ConceptNetSynonymProvider`, etc.) implement an empty `validate(): void`.


# Events

Two events are dispatched during synonym lookup, allowing you to extend or observe the behaviour.

### BeforeSynonymSearchEvent

Dispatched **before** the provider is called. Contains the original request data.

| Property | Type | Description |
|----------|------|-------------|
| `provider` | `string` | FQCN of the provider |
| `word` | `string` | Word to find synonyms for |
| `context` | `?string` | Surrounding sentence (optional) |
| `locale` | `string` | Locale (e.g. `fr`, `en`) |

**Use cases**: logging, metrics, rate limiting, context enrichment, audit.

```php
use Ehyiah\QuillJsBundle\Event\Synonym\BeforeSynonymSearchEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener]
public function onBeforeSynonymSearch(BeforeSynonymSearchEvent $event): void
{
    // Log the request
    // Enforce rate limiting
    // Enrich the context
}
```

### AfterSynonymSearchEvent

Dispatched **after** the provider returns results. Contains both the request data and the results.

| Property | Type | Description |
|----------|------|-------------|
| `provider` | `string` | FQCN of the provider |
| `word` | `string` | Word that was looked up |
| `context` | `?string` | Surrounding sentence (optional) |
| `locale` | `string` | Locale used |
| `results` | `Synonym[]` | Array of `Synonym` DTOs returned by the provider |

**Use cases**: logging, statistics, result filtering, post-processing.

```php
use Ehyiah\QuillJsBundle\Event\Synonym\AfterSynonymSearchEvent;

#[AsEventListener]
public function onAfterSynonymSearch(AfterSynonymSearchEvent $event): void
{
    // Log results count
    // Filter out low-scoring results
    // Send to analytics
}
```

> **Note**: Events are not designed to implement security. See the Security section below.

# Security

The UX Quill bundle does not enforce any security policy on the synonym endpoint.

This is intentional to support all use cases:

* Back-office
* Public CMS
* Business application
* Headless API
* Intranet
* SaaS

The host application is solely responsible for securing the route.

### Role-based protection

To restrict access to users with a specific role:

```yaml
# config/packages/security.yaml

security:
    access_control:
        - { path: ^/_ux/quill/synonyms, roles: ROLE_EDITOR }
```

### Advanced protection with a Symfony Voter

If the decision depends on more complex business rules (active subscription, organization, license, quota, etc.), you can use a Symfony Voter via an `allow_if` expression.

#### Security configuration

```yaml
# config/packages/security.yaml

security:
    access_control:
        - {
              path: ^/_ux/quill/synonyms,
              allow_if: "is_granted('USE_SYNONYMS')"
          }
```

#### Creating the Voter

```php
<?php

namespace App\Security\Voter;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class SynonymVoter extends Voter
{
    public const USE_SYNONYMS = 'USE_SYNONYMS';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return self::USE_SYNONYMS === $attribute;
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token
    ): bool {
        $user = $token->getUser();

        // Example: check for an active subscription
        return $user instanceof User
            && $user->hasActiveSubscription();
    }
}
```

In this example, Symfony will automatically call the Voter when a request is made to the synonym endpoint.

### Recommendations

If your provider makes calls to paid external services (OpenAI, Anthropic, etc.), it is strongly recommended to protect the endpoint to prevent abuse and unexpected costs.

The bundle does not call `isGranted()` or `denyAccessUnlessGranted()` and is not aware of your application's roles or voters. All security decisions remain under the control of the host application.
