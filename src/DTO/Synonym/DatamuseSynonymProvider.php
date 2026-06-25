<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\DatamuseSynonymConfig;
use RuntimeException;

final class DatamuseSynonymProvider implements SynonymProviderInterface
{
    private const API_URL = 'https://api.datamuse.com/words';

    /** @var array<string, mixed> */
    private array $runtimeOptions = [];

    public function __construct(
        private readonly DatamuseSynonymConfig $config,
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
            '%s?rel_syn=%s&max=%d',
            self::API_URL,
            rawurlencode($word),
            $config->maxResults,
        );

        $data = $this->callApi($config, $url);

        return $this->parseResponse($data, $word);
    }

    /**
     * @return array<int, mixed>
     */
    private function callApi(DatamuseSynonymConfig $config, string $url): array
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

        if (false === $body || $httpCode >= 400) {
            throw new RuntimeException(sprintf('Datamuse API error (HTTP %d): %s', $httpCode, $body ?: 'Unknown error'));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException('Datamuse API returned invalid JSON.');
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
        $synonyms = [];

        foreach ($data as $item) {
            if (!is_array($item)) {
                continue;
            }

            $label = $item['word'] ?? null;

            if (!is_string($label)) {
                continue;
            }

            if (mb_strtolower($label) === $normalized) {
                continue;
            }

            $score = (float)($item['score'] ?? 1.0);
            $score = max(0, min(1, $score / 100000));

            $synonyms[] = new Synonym($label, $score);
        }

        return $synonyms;
    }
}
