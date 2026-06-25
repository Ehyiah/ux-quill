<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym\Config;

final class OpenAiSynonymConfig
{
    public function __construct(
        public readonly ?string $apiKey = null,
        public readonly string $model = 'gpt-4o-mini',
        public readonly int $maxResults = 10,
        public readonly string $apiUrl = 'https://api.openai.com/v1/chat/completions',
    ) {
    }
}
