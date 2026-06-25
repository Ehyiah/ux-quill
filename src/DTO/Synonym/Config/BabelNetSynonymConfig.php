<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class BabelNetSynonymConfig
{
    public readonly int $maxSynsets;
    public readonly int $timeout;

    public function __construct(
        public readonly ?string $apiKey = null,
        ?int $maxSynsets = null,
        ?int $timeout = null,
    ) {
        $this->maxSynsets = $maxSynsets ?? 3;
        $this->timeout = $timeout ?? 15;
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            apiKey: $this->apiKey,
            maxSynsets: $options['maxSynsets'] ?? $this->maxSynsets,
            timeout: $options['timeout'] ?? $this->timeout,
        );
    }
}
