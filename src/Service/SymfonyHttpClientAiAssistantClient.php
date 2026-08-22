<?php

namespace Ehyiah\QuillJsBundle\Service;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use JsonException;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class SymfonyHttpClientAiAssistantClient implements AiAssistantClientInterface
{
    private const MAX_RETURNED_ERROR_BODY_LENGTH = 200;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly ?LoggerInterface $logger = null,
    ) {
    }

    /**
     * @param array<int, array{role: string, content: string}> $messages
     *
     * @return array{result: string, usage: array<string, float|int>|null}
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
            $this->logger?->error('AI Assistant request failed at transport level.', ['exception' => $e]);

            throw new RuntimeException('AI API transport error. Check QUILL_AI_API_URL and network access.', 0, $e);
        }

        if ($statusCode >= 400) {
            $this->logger?->warning('AI API returned an HTTP error.', [
                'status_code' => $statusCode,
                'body' => mb_substr($body, 0, 1000),
                'url_host' => parse_url($config->apiUrl, PHP_URL_HOST),
            ]);

            throw new RuntimeException(sprintf('AI API returned HTTP %d.%s', $statusCode, $this->sanitizeBody($body)));
        }

        try {
            /** @var array<string, mixed> $data */
            $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            $this->logger?->error('AI API returned invalid JSON.', ['body' => mb_substr($body, 0, 1000)]);

            throw new RuntimeException('AI API returned an invalid response.', 0, $e);
        }

        $result = trim($data['choices'][0]['message']['content'] ?? '');
        $usage = $data['usage'] ?? null;

        return [
            'result' => $result,
            'usage' => is_array($usage) ? $usage : null,
        ];
    }

    /**
     * Keeps a short, useful excerpt of the upstream error for the browser,
     * while the full body is available in the server logs.
     */
    private function sanitizeBody(string $body): string
    {
        $excerpt = trim(str_replace(["\r", "\n"], ' ', $body));

        return '' === $excerpt ? '' : sprintf(' (%s)', mb_substr($excerpt, 0, self::MAX_RETURNED_ERROR_BODY_LENGTH));
    }
}
