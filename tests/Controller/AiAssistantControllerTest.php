<?php

namespace Ehyiah\QuillJsBundle\Tests\Controller;

use Ehyiah\QuillJsBundle\Controller\AiAssistantController;
use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use Ehyiah\QuillJsBundle\Service\AiAssistantPromptBuilder;
use Ehyiah\QuillJsBundle\Tests\Controller\Fixtures\CapturingAiAssistantClient;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @covers \Ehyiah\QuillJsBundle\Controller\AiAssistantController
 */
final class AiAssistantControllerTest extends TestCase
{
    public function testMissingHttpClientReturnsAnInstallationError(): void
    {
        $controller = $this->createController(new AiAssistantConfig());
        $response = $controller($this->createRequest([
            'feature' => 'generate',
            'text' => 'Generate a title',
        ]));

        self::assertSame(400, $response->getStatusCode());
        /** @var array{error: string} $body */
        $body = json_decode((string)$response->getContent(), true);
        self::assertStringContainsString('composer require symfony/http-client', $body['error']);
    }

    public function testApiConfigurationCannotBeOverriddenFromTheRequest(): void
    {
        $controller = $this->createController(new AiAssistantConfig());
        foreach (['api_url', 'model', 'max_tokens', 'temperature', 'timeout', 'reasoning'] as $option) {
            $response = $controller($this->createRequest([
                'feature' => 'generate',
                'text' => 'Generate a title',
                $option => 'client-value',
            ]));

            self::assertSame(400, $response->getStatusCode());
            /** @var array{error: string} $body */
            $body = json_decode((string)$response->getContent(), true);
            self::assertStringContainsString($option, $body['error']);
        }

        $response = $controller($this->createRequest([
            'feature' => 'generate',
            'text' => 'Generate a title',
            'options' => ['model' => 'client-model'],
        ]));

        self::assertSame(400, $response->getStatusCode());
    }

    public function testTextLongerThanMaxCharsIsRejected(): void
    {
        $controller = $this->createController(new AiAssistantConfig(maxTextChars: 5));
        $response = $controller($this->createRequest([
            'feature' => 'generate',
            'text' => 'abcdefghij',
        ]));

        self::assertSame(400, $response->getStatusCode());
        /** @var array{error: string} $body */
        $body = json_decode((string)$response->getContent(), true);
        self::assertStringContainsString('too long (10 characters)', $body['error']);
        self::assertStringContainsString('Maximum allowed: 5', $body['error']);
    }

    public function testValidRequestReturnsResultAndUsage(): void
    {
        $client = new CapturingAiAssistantClient();
        $controller = new AiAssistantController(
            new AiAssistantConfig(apiKey: 'secret'),
            new AiAssistantPromptBuilder(),
            $client,
        );

        $response = $controller($this->createRequest([
            'feature' => 'generate',
            'text' => 'Generate a title',
        ]));

        self::assertSame(200, $response->getStatusCode());
        self::assertSame(
            ['result' => 'Generated title', 'usage' => ['total_tokens' => 7]],
            json_decode((string)$response->getContent(), true),
        );

        self::assertNotNull($client->captured);
        self::assertSame('secret', $client->captured['config']->apiKey);
        self::assertCount(2, $client->captured['messages']);
        self::assertSame('user', $client->captured['messages'][1]['role']);
        self::assertSame('Generate a title', $client->captured['messages'][1]['content']);
    }

    private function createController(AiAssistantConfig $config): AiAssistantController
    {
        return new AiAssistantController($config, new AiAssistantPromptBuilder());
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function createRequest(array $payload): Request
    {
        return Request::create('/_ux/quill/ai-assistant', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: (string)json_encode($payload));
    }
}
