<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules\Config;

final class AiAssistantConfig
{
    public const DEFAULT_MAX_TEXT_CHARS = 8000;

    public readonly string $apiUrl;
    public readonly string $model;
    public readonly int $maxTokens;
    public readonly float $temperature;
    public readonly int $timeout;
    public readonly int $maxTextChars;

    public function __construct(
        public readonly ?string $apiKey = null,
        ?string $apiUrl = null,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null,
        ?int $maxTextChars = null,
    ) {
        $this->apiUrl = $apiUrl ?? 'https://api.openai.com/v1/chat/completions';
        $this->model = $model ?? 'gpt-4o-mini';
        $this->maxTokens = $maxTokens ?? 4096;
        $this->temperature = $temperature ?? 0.7;
        $this->timeout = $timeout ?? 120;
        $this->maxTextChars = $maxTextChars ?? self::DEFAULT_MAX_TEXT_CHARS;
    }
}
