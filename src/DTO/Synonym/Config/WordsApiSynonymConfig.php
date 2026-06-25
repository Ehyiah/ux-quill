<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class WordsApiSynonymConfig
{
    public function __construct(
        public readonly ?string $apiKey = null,
        public readonly string $apiHost = 'wordsapiv1.p.rapidapi.com',
        public readonly int $timeout = 15,
    ) {
    }
}
