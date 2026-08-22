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
    public const FEATURE_TOC = 'toc';
    public const FEATURE_SYNONYM = 'synonym';

    public const PROVIDER_OPTION = 'provider';
    public const MODEL_OPTION = 'model';
    public const TEMPERATURE_OPTION = 'temperature';
    public const UI_LANGUAGE_OPTION = 'ui_language';
    public const LABELS_OPTION = 'labels';
    public const KEYBOARD_SHORTCUT_OPTION = 'keyboardShortcut';

    private const ALLOWED_PROVIDERS = ['transformers', 'api', 'wllama'];
    private const ALLOWED_LANGUAGES = ['en', 'fr', 'de', 'es'];

    private const DEFAULT_KEYBOARD_SHORTCUT = [
        'key' => 'Space',
        'ctrlKey' => true,
        'shiftKey' => false,
        'altKey' => false,
        'metaKey' => false,
    ];

    public function __construct(
        public string $name = self::NAME,
        public array $options = [],
    ) {
        $defaults = [
            self::PROVIDER_OPTION => 'transformers',
            self::TEMPERATURE_OPTION => 0.7,
            'features' => [],
            'translate' => [
                'target_languages' => ['fr', 'en', 'es', 'de', 'it', 'pt'],
                'default_language' => 'en',
            ],
            'toc' => [
                'depth' => 3,
            ],
            'synonym' => [
                'count' => 5,
            ],
            self::KEYBOARD_SHORTCUT_OPTION => self::DEFAULT_KEYBOARD_SHORTCUT,
        ];

        $merged = array_merge($defaults, $options);

        $provider = $merged[self::PROVIDER_OPTION] ?? null;
        if (null !== $provider && !in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            throw new InvalidArgumentException(sprintf('AiAssistantModule provider must be one of: %s. Got "%s".', implode(', ', self::ALLOWED_PROVIDERS), $provider));
        }

        $model = $merged[self::MODEL_OPTION] ?? null;
        if (null !== $model && (!is_string($model) || '' === trim($model))) {
            throw new InvalidArgumentException('AiAssistantModule model must be a non-empty string.');
        }

        $uiLanguage = $merged[self::UI_LANGUAGE_OPTION] ?? null;
        if (null !== $uiLanguage && !in_array($uiLanguage, self::ALLOWED_LANGUAGES, true)) {
            throw new InvalidArgumentException(sprintf('AiAssistantModule ui_language must be one of: %s. Got "%s".', implode(', ', self::ALLOWED_LANGUAGES), $uiLanguage));
        }

        $keyboardShortcut = $merged[self::KEYBOARD_SHORTCUT_OPTION] ?? null;
        if (false === $keyboardShortcut) {
            $merged[self::KEYBOARD_SHORTCUT_OPTION] = false;
        } else {
            if (!is_array($keyboardShortcut)) {
                throw new InvalidArgumentException('AiAssistantModule keyboardShortcut must be an array or false.');
            }
            if (!array_key_exists('key', $keyboardShortcut) || !is_string($keyboardShortcut['key']) || '' === $keyboardShortcut['key']) {
                throw new InvalidArgumentException('AiAssistantModule keyboardShortcut must contain a non-empty string "key".');
            }
            foreach (['ctrlKey', 'shiftKey', 'altKey', 'metaKey'] as $modifier) {
                if (array_key_exists($modifier, $keyboardShortcut) && !is_bool($keyboardShortcut[$modifier])) {
                    throw new InvalidArgumentException(sprintf('AiAssistantModule keyboardShortcut "%s" must be a boolean.', $modifier));
                }
            }
            $merged[self::KEYBOARD_SHORTCUT_OPTION] = array_merge(self::DEFAULT_KEYBOARD_SHORTCUT, $keyboardShortcut);
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
    }
}
