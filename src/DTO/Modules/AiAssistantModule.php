<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

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

    public function __construct(
        public string $name = self::NAME,
        array $options = [],
    ) {
        $defaults = [
            'features' => [],
            'translate' => [
                'target_languages' => ['fr', 'en', 'es', 'de', 'it', 'pt'],
                'default_language' => 'en',
            ],
            'toc' => [
                'depth' => 3,
            ],
        ];

        $this->options = array_merge($defaults, $options);
    }
}
