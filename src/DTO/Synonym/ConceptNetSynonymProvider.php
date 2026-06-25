<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\ConceptNetSynonymConfig;
use RuntimeException;

final class ConceptNetSynonymProvider implements SynonymProviderInterface
{
    private const API_URL = 'https://api.conceptnet.io/query';

    /** @var array<string, mixed> */
    private array $runtimeOptions = [];

    public function __construct(
        private readonly ConceptNetSynonymConfig $config,
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
            '%s?node=/c/%s/%s&rel=/r/Synonym&limit=%d',
            self::API_URL,
            $locale,
            rawurlencode($word),
            $config->maxResults,
        );

        $data = $this->callApi($config, $url);

        return $this->parseResponse($data, $locale, $word);
    }

    /**
     * @return array<string, mixed>
     */
    private function callApi(ConceptNetSynonymConfig $config, string $url): array
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
            throw new RuntimeException(sprintf('ConceptNet API error (HTTP %d): %s', $httpCode, $body ?: 'Unknown error'));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException('ConceptNet API returned invalid JSON.');
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return Synonym[]
     */
    private function parseResponse(array $data, string $locale, string $word): array
    {
        $normalized = mb_strtolower($word);
        $seen = [];
        $synonyms = [];

        $edges = $data['edges'] ?? [];

        foreach ($edges as $edge) {
            foreach (['start', 'end'] as $key) {
                $node = $edge[$key] ?? null;

                if (!is_array($node)) {
                    continue;
                }

                $language = $node['language'] ?? null;
                $label = $node['label'] ?? null;

                if (!is_string($language) || !is_string($label)) {
                    continue;
                }

                if ($language !== $locale) {
                    continue;
                }

                $labelNormalized = mb_strtolower(trim($label));

                if ($labelNormalized === $normalized) {
                    continue;
                }

                $key = $locale . ':' . $labelNormalized;
                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $synonyms[] = new Synonym($label, 1.0);
            }
        }

        return $synonyms;
    }
}
