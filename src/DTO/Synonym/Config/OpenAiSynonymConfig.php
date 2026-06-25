<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class OpenAiSynonymConfig
{
    public readonly string $model;
    public readonly int $maxResults;
    public readonly string $apiUrl;

    public function __construct(
        public readonly ?string $apiKey = null,
        ?string $model = null,
        ?int $maxResults = null,
        ?string $apiUrl = null,
    ) {
        $this->model = $model ?? 'gpt-4o-mini';
        $this->maxResults = $maxResults ?? 10;
        $this->apiUrl = $apiUrl ?? 'https://api.openai.com/v1/chat/completions';
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            apiKey: $this->apiKey,
            model: $options['model'] ?? $this->model,
            maxResults: $options['maxResults'] ?? $this->maxResults,
            apiUrl: $options['apiUrl'] ?? $this->apiUrl,
        );
    }
}
