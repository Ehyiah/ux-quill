<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules\Config;

final class AiAssistantConfig
{
    public readonly string $apiUrl;
    public readonly string $model;
    public readonly int $maxTokens;
    public readonly float $temperature;
    public readonly int $timeout;

    public function __construct(
        public readonly ?string $apiKey = null,
        ?string $apiUrl = null,
        ?string $model = null,
        ?int $maxTokens = null,
        ?float $temperature = null,
        ?int $timeout = null,
    ) {
        $this->apiUrl = $apiUrl ?? 'https://api.openai.com/v1/chat/completions';
        $this->model = $model ?? 'gpt-4o-mini';
        $this->maxTokens = $maxTokens ?? 4096;
        $this->temperature = $temperature ?? 0.7;
        $this->timeout = $timeout ?? 120;
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            apiKey: $this->apiKey,
            apiUrl: $options['api_url'] ?? $this->apiUrl,
            model: $options['model'] ?? $this->model,
            maxTokens: $options['max_tokens'] ?? $this->maxTokens,
            temperature: $options['temperature'] ?? $this->temperature,
            timeout: $options['timeout'] ?? $this->timeout,
        );
    }
}
