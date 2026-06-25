<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class FreeDictionarySynonymConfig
{
    public function __construct(
        public readonly int $timeout = 15,
    ) {
    }

    /**
     * @param array<string, mixed> $options
     */
    public function withOptions(array $options): self
    {
        return new self(
            timeout: $options['timeout'] ?? $this->timeout,
        );
    }
}
