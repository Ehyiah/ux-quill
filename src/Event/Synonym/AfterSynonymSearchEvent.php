<?php

namespace Ehyiah\QuillJsBundle\Event\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;

final class AfterSynonymSearchEvent
{
    /**
     * @param Synonym[] $results
     */
    public function __construct(
        public readonly string $provider,
        public readonly string $word,
        public readonly ?string $context,
        public readonly string $locale,
        public readonly array $results,
    ) {
    }
}
