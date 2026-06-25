<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\FreeDictionarySynonymConfig;
use RuntimeException;

final class FreeDictionarySynonymProvider implements SynonymProviderInterface
{
    private const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries';

    /** @var array<string, mixed> */
    private array $runtimeOptions = [];

    public function __construct(
        private readonly FreeDictionarySynonymConfig $config,
    ) {
    }

    /**
     * @param array<string, mixed> $options
     */
    public function configureOptions(array $options): void
    {
        $this->runtimeOptions = $options;
    }

    public function validate(): void
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
        $config = $this->config->withOptions($this->runtimeOptions);

        $url = sprintf(
            '%s/%s/%s',
            self::API_URL,
            $locale,
            rawurlencode($word),
        );

        $data = $this->callApi($config, $url);

        return $this->parseResponse($data, $word);
    }

    /**
     * @return array<int, mixed>
     */
    private function callApi(FreeDictionarySynonymConfig $config, string $url): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $config->timeout,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (false === $body) {
            throw new RuntimeException('FreeDictionary API returned no response.');
        }

        if (404 === $httpCode) {
            return [];
        }

        if ($httpCode >= 400) {
            throw new RuntimeException(sprintf('FreeDictionary API error (HTTP %d): %s', $httpCode, $body));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException('FreeDictionary API returned invalid JSON.');
        }

        return $data;
    }

    /**
     * @param array<int, mixed> $data
     *
     * @return Synonym[]
     */
    private function parseResponse(array $data, string $word): array
    {
        $normalized = mb_strtolower($word);
        $seen = [];
        $synonyms = [];

        foreach ($data as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            $meanings = $entry['meanings'] ?? [];

            if (!is_array($meanings)) {
                continue;
            }

            foreach ($meanings as $meaning) {
                if (!is_array($meaning)) {
                    continue;
                }

                $meaningSynonyms = $meaning['synonyms'] ?? [];

                if (!is_array($meaningSynonyms)) {
                    continue;
                }

                foreach ($meaningSynonyms as $label) {
                    if (!is_string($label)) {
                        continue;
                    }

                    if (mb_strtolower($label) === $normalized) {
                        continue;
                    }

                    $key = mb_strtolower($label);
                    if (isset($seen[$key])) {
                        continue;
                    }

                    $seen[$key] = true;
                    $synonyms[] = new Synonym($label, 1.0);
                }
            }
        }

        return $synonyms;
    }
}
