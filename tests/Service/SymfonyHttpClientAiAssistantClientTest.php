<?php

namespace Ehyiah\QuillJsBundle\Tests\Service;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use Ehyiah\QuillJsBundle\Service\SymfonyHttpClientAiAssistantClient;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

/**
 * @coversNothing
 */
final class SymfonyHttpClientAiAssistantClientTest extends TestCase
{
    public function testCompleteSendsOpenAiCompatibleRequest(): void
    {
        $request = null;
        $httpClient = new MockHttpClient(static function (string $method, string $url, array $options) use (&$request): MockResponse {
            $request = [$method, $url, $options];

            return new MockResponse((string)json_encode([
                'choices' => [
                    ['message' => ['content' => ' Result ']],
                ],
                'usage' => ['prompt_tokens' => 2, 'completion_tokens' => 3],
            ]));
        });
        $client = new SymfonyHttpClientAiAssistantClient($httpClient);

        $result = $client->complete(
            new AiAssistantConfig(apiKey: 'secret', apiUrl: 'https://example.test/v1/chat/completions', model: 'test-model'),
            [
                ['role' => 'user', 'content' => 'Hello'],
            ],
        );

        /** @var array<string, mixed> $options */
        $options = $request[2];
        self::assertSame('Hello', json_decode($options['body'], true)['messages'][0]['content']);
        self::assertSame('POST', $request[0]);
        self::assertSame('https://example.test/v1/chat/completions', $request[1]);
        self::assertContains('authorization: bearer secret', array_map('strtolower', $options['headers']));
        self::assertSame('Result', $result['result']);
        self::assertSame(['prompt_tokens' => 2, 'completion_tokens' => 3], $result['usage']);
    }

    public function testCompleteThrowsForAnApiError(): void
    {
        $client = new SymfonyHttpClientAiAssistantClient(new MockHttpClient(new MockResponse('Bad request', ['http_code' => 400])));

        $this->expectExceptionMessage('API error (HTTP 400): Bad request');
        $client->complete(new AiAssistantConfig(), []);
    }
}
