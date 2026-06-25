<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use RuntimeException;

interface SynonymProviderInterface
{
    /**
     * Apply runtime options from the form (non-sensitive config only).
     *
     * @param array<string, mixed> $options
     */
    public function configureOptions(array $options): void;

    /**
     * @return Synonym[]
     */
    public function getSynonyms(
        string $word,
        ?string $context = null,
        string $locale = 'en',
    ): array;

    /**
     * Validate that the provider is properly configured.
     *
     * @throws RuntimeException if configuration is invalid
     */
    public function validate(): void;
}
