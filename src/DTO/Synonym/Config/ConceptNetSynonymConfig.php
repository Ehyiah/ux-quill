<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class ConceptNetSynonymConfig
{
    public function __construct(
        public readonly int $maxResults = 20,
        public readonly int $timeout = 15,
    ) {
    }
}
