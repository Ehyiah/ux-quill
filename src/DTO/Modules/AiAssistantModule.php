<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

use InvalidArgumentException;

final class AiAssistantModule implements ModuleInterface
{
    public const NAME = 'aiAssistant';

    public const FEATURE_REWRITE = 'rewrite';
    public const FEATURE_TRANSLATE = 'translate';
    public const FEATURE_GRAMMAR = 'grammar';
    public const FEATURE_GENERATE = 'generate';
    public const FEATURE_SUMMARIZE = 'summarize';
    public const FEATURE_SEMANTIC = 'semantic';
    public const FEATURE_TOC = 'toc';

    public const PROVIDER_OPTION = 'provider';
    public const MODELS_OPTION = 'models';
    public const REASONING_OPTION = 'reasoning';

    private const ALLOWED_PROVIDERS = ['transformers', 'api', 'wllama'];

    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
        $defaults = [
            self::PROVIDER_OPTION => 'transformers',
            self::REASONING_OPTION => true,
            'features' => [],
            'translate' => [
                'target_languages' => ['fr', 'en', 'es', 'de', 'it', 'pt'],
                'default_language' => 'en',
            ],
            'toc' => [
                'depth' => 3,
            ],
        ];

        $merged = array_merge($defaults, $options);

        $provider = $merged[self::PROVIDER_OPTION] ?? null;
        if (null !== $provider && !in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            throw new InvalidArgumentException(sprintf('AiAssistantModule provider must be one of: %s. Got "%s".', implode(', ', self::ALLOWED_PROVIDERS), $provider));
        }

        $this->rejectSensitiveKeys($merged);

        $this->options = $merged;
    }

    /**
     * @return array<string, mixed>
     */
    public function getOptions(): array
    {
        $options = $this->options;

        // security: never serialize apiKey or api_key to frontend
        unset($options['apiKey'], $options['api_key']);

        return $options;
    }

    /**
     * @param array<string, mixed> $options
     */
    private function rejectSensitiveKeys(array $options): void
    {
        foreach (['apiKey', 'api_key'] as $key) {
            if (array_key_exists($key, $options)) {
                throw new InvalidArgumentException(sprintf('The "%s" option cannot be set in AiAssistantModule options. Use environment variables (QUILL_AI_API_KEY) instead.', $key));
            }
        }

        $models = $options[self::MODELS_OPTION] ?? [];
        if (is_array($models)) {
            foreach ($models as $feature => $modelConfig) {
                if (is_array($modelConfig) && (isset($modelConfig['apiKey']) || isset($modelConfig['api_key']))) {
                    throw new InvalidArgumentException(sprintf('The "apiKey" option cannot be set in models.%s. Use environment variables instead.', $feature));
                }
            }
        }
    }
}
