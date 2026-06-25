<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\WordsApiSynonymConfig;
use RuntimeException;

final class WordsApiSynonymProvider implements SynonymProviderInterface
{
    private const API_URL = 'https://wordsapiv1.p.rapidapi.com/words';

    public function __construct(
        private readonly WordsApiSynonymConfig $config,
    ) {
    }

    public function validate(): void
    {
        if (null === $this->config->apiKey || '' === $this->config->apiKey) {
            throw new RuntimeException('WordsApiSynonymProvider requires an API key.');
        }
    }

    /**
     * @return Synonym[]
     */
    public function getSynonyms(
        string $word,
        ?string $context = null,
        string $locale = 'en',
    ): array {
        $url = sprintf(
            '%s/%s/synonyms',
            self::API_URL,
            rawurlencode($word),
        );

        $data = $this->callApi($url);

        return $this->parseResponse($data, $word);
    }

    /**
     * @return array<string, mixed>
     */
    private function callApi(string $url): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->config->timeout,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'X-RapidAPI-Key: ' . $this->config->apiKey,
                'X-RapidAPI-Host: ' . $this->config->apiHost,
            ],
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (false === $body || $httpCode >= 400) {
            throw new RuntimeException(sprintf('WordsAPI error (HTTP %d): %s', $httpCode, $body ?: 'Unknown error'));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException('WordsAPI returned invalid JSON.');
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return Synonym[]
     */
    private function parseResponse(array $data, string $word): array
    {
        $normalized = mb_strtolower($word);
        $synonyms = [];

        $items = $data['synonyms'] ?? [];

        if (!is_array($items)) {
            return $synonyms;
        }

        foreach ($items as $label) {
            if (!is_string($label)) {
                continue;
            }

            if (mb_strtolower($label) === $normalized) {
                continue;
            }

            $synonyms[] = new Synonym($label, 1.0);
        }

        return $synonyms;
    }
}
