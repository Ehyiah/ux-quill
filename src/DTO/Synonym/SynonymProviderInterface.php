<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use RuntimeException;

interface SynonymProviderInterface
{
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
