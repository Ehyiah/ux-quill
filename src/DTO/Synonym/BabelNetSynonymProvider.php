<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\BabelNetSynonymConfig;
use RuntimeException;

final class BabelNetSynonymProvider implements SynonymProviderInterface
{
    private const API_BASE = 'https://babelnet.io/v9';

    /** @var array<string, mixed> */
    private array $runtimeOptions = [];

    public function __construct(
        private readonly BabelNetSynonymConfig $config,
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
        $config = $this->config->withOptions($this->runtimeOptions);

        if (null === $config->apiKey || '' === $config->apiKey) {
            throw new RuntimeException('BabelNetSynonymProvider requires an API key.');
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
        $config = $this->config->withOptions($this->runtimeOptions);
        $targetLang = strtoupper($locale);

        $synsetIds = $this->fetchSynsetIds($config, $word, $targetLang);

        return $this->fetchSynonymLemmas($config, $synsetIds, $targetLang, $word);
    }

    /**
     * @return string[]
     */
    private function fetchSynsetIds(BabelNetSynonymConfig $config, string $word, string $targetLang): array
    {
        $url = sprintf(
            '%s/getSynsetIds?lemma=%s&searchLang=%s&key=%s',
            self::API_BASE,
            rawurlencode($word),
            $targetLang,
            $config->apiKey,
        );

        $data = $this->callApi($config, $url);

        $ids = [];

        foreach ($data as $item) {
            if (is_array($item) && isset($item['id']) && is_string($item['id'])) {
                $ids[] = $item['id'];
            }
        }

        return $ids;
    }

    /**
     * @param string[] $synsetIds
     *
     * @return Synonym[]
     */
    private function fetchSynonymLemmas(BabelNetSynonymConfig $config, array $synsetIds, string $targetLang, string $word): array
    {
        $normalized = mb_strtolower($word);
        $seen = [];
        $synonyms = [];
        $limit = min(count($synsetIds), $config->maxSynsets);

        for ($i = 0; $i < $limit; ++$i) {
            $url = sprintf(
                '%s/getSynset?id=%s&targetLang=%s&key=%s',
                self::API_BASE,
                $synsetIds[$i],
                $targetLang,
                $config->apiKey,
            );

            try {
                $data = $this->callApi($config, $url);
            } catch (RuntimeException) {
                continue;
            }

            $senses = $data['senses'] ?? [];

            if (!is_array($senses)) {
                continue;
            }

            foreach ($senses as $sense) {
                if (!is_array($sense)) {
                    continue;
                }

                $lemma = $this->extractLemma($sense);
                $senseLang = $this->extractLanguage($sense);

                if (null === $lemma || null === $senseLang) {
                    continue;
                }

                if ($senseLang !== $targetLang) {
                    continue;
                }

                if (str_contains($lemma, '(')) {
                    continue;
                }

                $cleaned = str_replace('_', ' ', $lemma);
                $cleanedNormalized = mb_strtolower(trim($cleaned));

                if ($cleanedNormalized === $normalized || '' === $cleanedNormalized) {
                    continue;
                }

                $key = $targetLang . ':' . $cleanedNormalized;
                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $synonyms[] = new Synonym($cleaned, 1.0);
            }
        }

        return $synonyms;
    }

    /**
     * @param array<string, mixed> $sense
     */
    private function extractLemma(array $sense): ?string
    {
        if (isset($sense['properties']['simpleLemma']) && is_string($sense['properties']['simpleLemma'])) {
            return $sense['properties']['simpleLemma'];
        }

        if (isset($sense['properties']['fullLemma']) && is_string($sense['properties']['fullLemma'])) {
            return $sense['properties']['fullLemma'];
        }

        if (isset($sense['properties']['lemma']) && is_string($sense['properties']['lemma'])) {
            return $sense['properties']['lemma'];
        }

        if (isset($sense['lemma']['lemma']) && is_string($sense['lemma']['lemma'])) {
            return $sense['lemma']['lemma'];
        }

        if (isset($sense['lemma']['simpleLemma']) && is_string($sense['lemma']['simpleLemma'])) {
            return $sense['lemma']['simpleLemma'];
        }

        if (isset($sense['simpleLemma']) && is_string($sense['simpleLemma'])) {
            return $sense['simpleLemma'];
        }

        if (isset($sense['fullLemma']) && is_string($sense['fullLemma'])) {
            return $sense['fullLemma'];
        }

        if (isset($sense['lemma']) && is_string($sense['lemma'])) {
            return $sense['lemma'];
        }

        return null;
    }

    /**
     * @param array<string, mixed> $sense
     */
    private function extractLanguage(array $sense): ?string
    {
        if (isset($sense['properties']['language']) && is_string($sense['properties']['language'])) {
            return strtoupper($sense['properties']['language']);
        }

        if (isset($sense['lemma']['language']) && is_string($sense['lemma']['language'])) {
            return strtoupper($sense['lemma']['language']);
        }

        if (isset($sense['language']) && is_string($sense['language'])) {
            return strtoupper($sense['language']);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function callApi(BabelNetSynonymConfig $config, string $url): array
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
            throw new RuntimeException(sprintf('BabelNet API error (HTTP %d): %s', $httpCode, $body ?: 'Unknown error'));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($data)) {
            throw new RuntimeException('BabelNet API returned invalid JSON.');
        }

        return $data;
    }
}
