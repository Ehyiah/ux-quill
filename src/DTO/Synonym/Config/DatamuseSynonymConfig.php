<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class DatamuseSynonymConfig
{
    public function __construct(
        public readonly int $maxResults = 20,
        public readonly int $timeout = 15,
    ) {
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            maxResults: $options['maxResults'] ?? $this->maxResults,
            timeout: $options['timeout'] ?? $this->timeout,
        );
    }
}
