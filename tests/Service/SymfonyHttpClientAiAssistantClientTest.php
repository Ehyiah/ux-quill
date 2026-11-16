<?php

namespace Ehyiah\QuillJsBundle\Tests\Service;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use Ehyiah\QuillJsBundle\Service\SymfonyHttpClientAiAssistantClient;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Contracts\HttpClient\HttpClientInterface;

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

    public function testCompleteThrowsSanitizedErrorAndLogsForAnApiError(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects(self::once())
            ->method('warning')
            ->with(
                'AI API returned an HTTP error.',
                self::callback(static function (array $context): bool {
                    return isset($context['status_code'], $context['body'], $context['url_host'])
                        && 400 === $context['status_code']
                        && 'example.test' === $context['url_host'];
                }),
            )
        ;

        $config = new AiAssistantConfig(apiUrl: 'https://example.test/v1/chat/completions');
        $client = new SymfonyHttpClientAiAssistantClient(
            new MockHttpClient(new MockResponse('Bad request', ['http_code' => 400])),
            $logger,
        );

        try {
            $client->complete($config, []);
            self::fail('Expected a RuntimeException to be thrown.');
        } catch (RuntimeException $exception) {
            self::assertSame('AI API returned HTTP 400. (Bad request)', $exception->getMessage());
        }
    }

    public function testCompleteWrapsTransportErrorsWithALogEntry(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects(self::once())->method('error');

        $httpClient = $this->createStub(HttpClientInterface::class);
        $httpClient->method('request')->willThrowException(new TransportException('Connection reset'));

        $client = new SymfonyHttpClientAiAssistantClient($httpClient, $logger);

        $this->expectExceptionMessage('AI API transport error. Check QUILL_AI_API_URL and network access.');
        $client->complete(new AiAssistantConfig(), []);
    }

    public function testCompleteThrowsForInvalidJsonResponses(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects(self::once())->method('error');

        $client = new SymfonyHttpClientAiAssistantClient(
            new MockHttpClient(new MockResponse('{not-json')),
            $logger,
        );

        $this->expectExceptionMessage('AI API returned an invalid response.');
        $client->complete(new AiAssistantConfig(), []);
    }

    public function testUsageIsDroppedWhenUpstreamReturnsANonArrayUsage(): void
    {
        $client = new SymfonyHttpClientAiAssistantClient(
            new MockHttpClient(new MockResponse((string)json_encode([
                'choices' => [['message' => ['content' => 'ok']]],
                'usage' => 'unexpected',
            ]))),
        );

        $result = $client->complete(new AiAssistantConfig(), []);

        self::assertSame('ok', $result['result']);
        self::assertNull($result['usage']);
    }
}
