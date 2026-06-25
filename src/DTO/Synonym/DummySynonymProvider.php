<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

final class DummySynonymProvider implements SynonymProviderInterface
{
    /**
     * @param array<string, mixed> $options
     */
    public function configureOptions(array $options): void
    {
    }

    /**
     * @return Synonym[]
     */
    public function getSynonyms(
        string $word,
        ?string $context = null,
        string $locale = 'en',
    ): array {
        return [
            new Synonym('essentiel'),
            new Synonym('crucial', 0.8),
        ];
    }

    public function validate(): void
    {
    }
}
