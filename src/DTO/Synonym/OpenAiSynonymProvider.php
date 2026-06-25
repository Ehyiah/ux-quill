<?php

namespace Ehyiah\QuillJsBundle\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\OpenAiSynonymConfig;
use RuntimeException;

final class OpenAiSynonymProvider implements SynonymProviderInterface
{
    public function __construct(
        private readonly OpenAiSynonymConfig $config,
    ) {
    }

    public function validate(): void
    {
        if (null === $this->config->apiKey || '' === $this->config->apiKey) {
            throw new RuntimeException('OpenAiSynonymProvider requires an API key.');
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
        $prompt = $this->buildPrompt($word, $context, $locale);

        $response = $this->callOpenAI($prompt);

        $synonyms = [];
        foreach ($response as $item) {
            $synonyms[] = new Synonym(
                word: $item['word'],
                score: (float)($item['score']),
            );
        }

        return $synonyms;
    }

    /**
     * @return array<int, array{word: string, score: float}>
     */
    private function callOpenAI(string $prompt): array
    {
        $payload = json_encode([
            'model' => $this->config->model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful lexicography assistant. Respond only with valid JSON.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.3,
            'max_tokens' => 300,
        ], JSON_THROW_ON_ERROR);

        $ch = curl_init($this->config->apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->config->apiKey,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (false === $body || $httpCode >= 400) {
            throw new RuntimeException(sprintf('OpenAI API error (HTTP %d): %s', $httpCode, $body ?: 'Unknown error'));
        }

        /** @var string $body */
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        $content = trim($data['choices'][0]['message']['content'] ?? '');
        $content = preg_replace('/^```(?:json)?\s*/i', '', (string)$content);
        $content = preg_replace('/\s*```$/', '', (string)$content);

        $items = json_decode((string)$content, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($items)) {
            return [];
        }

        return array_map(static function ($item) {
            if (is_string($item)) {
                return ['word' => $item, 'score' => 1.0];
            }

            return [
                'word' => $item['word'] ?? $item[0] ?? '',
                'score' => (float)($item['score'] ?? $item[1] ?? 1.0),
            ];
        }, $items);
    }

    private function buildPrompt(string $word, ?string $context, string $locale): string
    {
        $parts = [
            sprintf('Find synonyms for the word "%s" in %s.', $word, $locale),
        ];

        if ($context) {
            $parts[] = sprintf('Context sentence: "%s".', $context);
            $parts[] = 'Consider the meaning of the word in this context.';
        }

        $parts[] = 'Respond ONLY with a JSON array of objects in format [{"word": "...", "score": 0.0-1.0}].';
        $parts[] = 'Sort by relevance (highest score first).';
        $parts[] = sprintf('Return at most %d results.', $this->config->maxResults);

        return implode(' ', $parts);
    }
}
