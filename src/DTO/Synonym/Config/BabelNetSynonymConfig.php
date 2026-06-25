<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class BabelNetSynonymConfig
{
    public function __construct(
        public readonly ?string $apiKey = null,
        public readonly int $maxSynsets = 3,
        public readonly int $timeout = 15,
    ) {
    }
}
