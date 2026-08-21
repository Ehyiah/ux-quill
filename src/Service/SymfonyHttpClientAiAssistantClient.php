<?php

namespace Ehyiah\QuillJsBundle\Service;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use JsonException;
use RuntimeException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class SymfonyHttpClientAiAssistantClient implements AiAssistantClientInterface
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
    ) {
    }

    /**
     * @param array<int, array{role: string, content: string}> $messages
     *
     * @return array{result: string, usage: array<string, int>|null}
     */
    public function complete(AiAssistantConfig $config, array $messages): array
    {
        $headers = [
            'Content-Type' => 'application/json',
        ];

        if (null !== $config->apiKey && '' !== $config->apiKey) {
            $headers['Authorization'] = 'Bearer ' . $config->apiKey;
        }

        try {
            $response = $this->httpClient->request('POST', $config->apiUrl, [
                'headers' => $headers,
                'json' => [
                    'model' => $config->model,
                    'messages' => $messages,
                    'max_tokens' => $config->maxTokens,
                    'temperature' => $config->temperature,
                ],
                'timeout' => $config->timeout,
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getContent(false);
        } catch (TransportExceptionInterface $e) {
            throw new RuntimeException('AI API transport error: ' . $e->getMessage(), 0, $e);
        }

        if ($statusCode >= 400) {
            throw new RuntimeException(sprintf('API error (HTTP %d): %s', $statusCode, $body ?: 'Unknown error'));
        }

        try {
            /** @var array<string, mixed> $data */
            $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException('AI API returned invalid JSON.', 0, $e);
        }

        $result = trim($data['choices'][0]['message']['content'] ?? '');
        $usage = $data['usage'] ?? null;

        return [
            'result' => $result,
            'usage' => is_array($usage) ? $usage : null,
        ];
    }
}
