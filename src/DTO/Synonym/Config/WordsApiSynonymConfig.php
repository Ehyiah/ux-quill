<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class WordsApiSynonymConfig
{
    public readonly string $apiHost;
    public readonly int $timeout;

    public function __construct(
        public readonly ?string $apiKey = null,
        ?string $apiHost = null,
        ?int $timeout = null,
    ) {
        $this->apiHost = $apiHost ?? 'wordsapiv1.p.rapidapi.com';
        $this->timeout = $timeout ?? 15;
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            apiKey: $this->apiKey,
            apiHost: $options['apiHost'] ?? $this->apiHost,
            timeout: $options['timeout'] ?? $this->timeout,
        );
    }
}
