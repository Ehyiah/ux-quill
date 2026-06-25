<?php

namespace Ehyiah\QuillJsBundle\Event\Synonym;

final class BeforeSynonymSearchEvent
{
    public function __construct(
        public readonly string $provider,
        public readonly string $word,
        public readonly ?string $context,
        public readonly string $locale,
    ) {
    }
}
