# Synonym Module

The Synonym module allows users to find and replace words with synonyms directly from the Quill editor.

## Architecture

Instead of hardcoding API providers in JavaScript, this module delegates all synonym lookups to a **server-side provider**. The frontend sends the selected word (and optional context) to a Symfony endpoint, which delegates the request to a registered `SynonymProviderInterface` implementation.

```
┌──────────────┐   POST /_ux/quill/synonyms   ┌──────────────────┐
│  Quill Editor │ ──────────────────────────►  │ SynonymController │
│  (JavaScript) │                               │      (PHP)       │
│               │ ◄──────────────────────────── │                  │
│               │   JSON [{word, score}]        └────────┬─────────┘
└──────────────┘                                        │
                                                  ┌──────▼──────┐
                                                  │  Provider   │
                                                  │  Registry   │
                                                  └──────┬──────┘
                                                  ┌──────▼──────┐
                                                  │  MyProvider  │
                                                  │  (interface) │
                                                  └─────────────┘
```

## Creating a provider

Implement the `SynonymProviderInterface`:

```php
use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use RuntimeException;

class MySynonymProvider implements SynonymProviderInterface
{
    /**
     * @return Synonym[]
     */
    public function getSynonyms(
        string $word,
        ?string $context = null,
        string $locale = 'fr',
    ): array {
        // Your custom logic here
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

## Using the module

```php
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;

// Basic usage
new SynonymModule(
    options: [
        SynonymModule::PROVIDER_OPTION => App\Quill\MySynonymProvider::class,
    ],
);

// With custom options
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
| `PROVIDER_OPTION` | `string` | — | FQCN of the synonym provider |
| `locale` | `string` | `'en'` | Locale for the synonym search |
| `icon` | `string\|HTMLElement` | `'🔄'` | Icon for the toolbar button |
| `headerText` | `string` | `'Look for synonyms'` | Popup header text |
| `noSynonymText` | `string` | `'No Results for : {word}'` | Text shown when no synonyms are found |
| `showScore` | `bool` | `false` | Show relevance score badge (useful with AI providers like `OpenAiSynonymProvider`) |
| `debug` | `bool` | `false` | Enable console debug logs |

## Routing

Import the bundle's routes in your application:

```yaml
# config/routes/ux_quill.yaml
ux_quill_synonyms:
    resource: '@QuillJsBundle/Resources/config/routes/synonym.xml'
```

## Events

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

## Security

The bundle UX Quill n'impose aucune politique de sécurité sur l'endpoint des synonymes.

Cette décision est volontaire afin de permettre tous les cas d'usage :

* Back-office
* CMS public
* Application métier
* API headless
* Intranet
* SaaS

L'application hôte reste entièrement responsable de la sécurisation de la route.

### Protection par rôle

Pour limiter l'accès aux utilisateurs disposant d'un rôle spécifique :

```yaml
# config/packages/security.yaml

security:
    access_control:
        - { path: ^/_ux/quill/synonyms, roles: ROLE_EDITOR }
```

### Protection avancée avec un Voter Symfony

Si la décision dépend de règles métier plus complexes (abonnement actif, organisation, licence, quota, etc.), vous pouvez utiliser un Voter Symfony via une expression `allow_if`.

#### Configuration de sécurité

```yaml
# config/packages/security.yaml

security:
    access_control:
        - {
              path: ^/_ux/quill/synonyms,
              allow_if: "is_granted('USE_SYNONYMS')"
          }
```

#### Création du Voter

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

        // Exemple : vérifier un abonnement actif
        return $user instanceof User
            && $user->hasActiveSubscription();
    }
}
```

Dans cet exemple, Symfony appellera automatiquement le Voter lorsqu'une requête sera effectuée sur l'endpoint des synonymes.

### Recommandations

Si votre provider effectue des appels vers des services externes payants (OpenAI, Anthropic, etc.), il est fortement recommandé de protéger l'endpoint afin d'éviter les abus et les coûts inattendus.

Le bundle ne fait aucun appel à `isGranted()` ou `denyAccessUnlessGranted()` et ne connaît pas les rôles ou voters de votre application. Toutes les décisions de sécurité restent sous le contrôle de l'application hôte.

## Environment variables

Providers requiring an API key use the following environment variables in your `.env` file:

| Variable | Required by |
|----------|-------------|
| `QUILL_OPENAI_API_KEY` | `OpenAiSynonymProvider` |
| `QUILL_BABELNET_API_KEY` | `BabelNetSynonymProvider` |
| `QUILL_WORDSAPI_API_KEY` | `WordsApiSynonymProvider` |

## Built-in providers

Each provider accepts a **Config DTO** as its single constructor argument. Config DTOs expose all available options as typed public readonly properties — visible directly in your IDE via autocompletion.

| Provider | Key | Free | Multi-lang | Score |
|----------|-----|------|------------|-------|
| `DummySynonymProvider` | No | Yes | Static | Static |
| `ConceptNetSynonymProvider` | No | Yes | Yes | No |
| `DatamuseSynonymProvider` | No | Yes | EN mainly | Yes |
| `FreeDictionarySynonymProvider` | No | Yes | Yes | No |
| `BabelNetSynonymProvider` | Yes (free tier) | Yes | Yes | No |
| `WordsApiSynonymProvider` | Yes (RapidAPI) | No | EN | No |
| `OpenAiSynonymProvider` | Yes (OpenAI) | No | Yes | Yes |

### DummySynonymProvider

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

### ConceptNetSynonymProvider

Uses the [ConceptNet](http://conceptnet.io) API to find synonyms. Free, no API key required, supports many languages.

| Config option | Type | Default | Description |
|---|---|---|---|
| `maxResults` | `int` | `20` | Max results per request |
| `timeout` | `int` | `15` | HTTP timeout in seconds |

```php
use App\Form\SomeType;
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\ConceptNetSynonymProvider;

// Dans votre FormType::buildForm
$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => ConceptNetSynonymProvider::class,
        ]),
    ],
]);
```

### DatamuseSynonymProvider

Uses the [Datamuse](https://www.datamuse.com/api/) API to find synonyms. Includes relevance scoring. Primarily English.

| Config option | Type | Default | Description |
|---|---|---|---|
| `maxResults` | `int` | `20` | Max results per request |
| `timeout` | `int` | `15` | HTTP timeout in seconds |

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\DatamuseSynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => DatamuseSynonymProvider::class,
        ]),
    ],
]);
```

### FreeDictionarySynonymProvider

Uses the [Free Dictionary API](https://dictionaryapi.dev/) to find synonyms. Free, no API key, supports many languages.

| Config option | Type | Default | Description |
|---|---|---|---|
| `timeout` | `int` | `15` | HTTP timeout in seconds |

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\FreeDictionarySynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => FreeDictionarySynonymProvider::class,
        ]),
    ],
]);
```

### BabelNetSynonymProvider

Uses the [BabelNet](https://babelnet.org/) API (v9) to find synonyms. Requires a free API key (1000 requests/day limit).

| Config option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `?string` | `null` | BabelNet API key (set via `QUILL_BABELNET_API_KEY` env var) |
| `maxSynsets` | `int` | `3` | Max synsets to query |
| `timeout` | `int` | `15` | HTTP timeout in seconds |

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\BabelNetSynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => BabelNetSynonymProvider::class,
        ]),
    ],
]);
```

### WordsApiSynonymProvider

Uses the [WordsAPI](https://www.wordsapi.com/) via RapidAPI. Requires a RapidAPI key. Primarily English.

| Config option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `?string` | `null` | RapidAPI key (set via `QUILL_WORDSAPI_API_KEY` env var) |
| `apiHost` | `string` | `wordsapiv1.p.rapidapi.com` | RapidAPI host |
| `timeout` | `int` | `15` | HTTP timeout in seconds |

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\WordsApiSynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => WordsApiSynonymProvider::class,
        ]),
    ],
]);
```

### OpenAiSynonymProvider

Uses OpenAI (GPT-4o-mini) to find contextual synonyms. The API key stays server-side. Supports custom model and endpoint (Azure, LocalAI, etc.).

| Config option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `?string` | `null` | OpenAI API key (set via `QUILL_OPENAI_API_KEY` env var) |
| `model` | `string` | `gpt-4o-mini` | Model name |
| `maxResults` | `int` | `10` | Max synonyms per request |
| `apiUrl` | `string` | `https://api.openai.com/v1/chat/completions` | API endpoint |

```php
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use Ehyiah\QuillJsBundle\DTO\Synonym\OpenAiSynonymProvider;

$builder->add('content', QuillType::class, [
    'modules' => [
        new SynonymModule(options: [
            SynonymModule::PROVIDER_OPTION => OpenAiSynonymProvider::class,
        ]),
    ],
]);
```
