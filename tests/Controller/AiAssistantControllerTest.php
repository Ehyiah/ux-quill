<?php

namespace Ehyiah\QuillJsBundle\Tests\Controller;

use Ehyiah\QuillJsBundle\Controller\AiAssistantController;
use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @covers \Ehyiah\QuillJsBundle\Controller\AiAssistantController
 */
final class AiAssistantControllerTest extends TestCase
{
    public function testMissingHttpClientReturnsAnInstallationError(): void
    {
        $controller = new AiAssistantController(new AiAssistantConfig());
        $request = Request::create('/_ux/quill/ai-assistant', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: (string)json_encode([
            'feature' => 'generate',
            'text' => 'Generate a title',
        ]));

        $response = $controller($request);

        self::assertSame(400, $response->getStatusCode());
        /** @var array{error: string} $body */
        $body = json_decode((string)$response->getContent(), true);
        self::assertStringContainsString('composer require symfony/http-client', $body['error']);
    }

    public function testApiConfigurationCannotBeOverriddenFromTheRequest(): void
    {
        $controller = new AiAssistantController(new AiAssistantConfig());
        foreach (['api_url', 'model', 'max_tokens', 'temperature', 'timeout', 'reasoning'] as $option) {
            $request = Request::create('/_ux/quill/ai-assistant', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: (string)json_encode([
                'feature' => 'generate',
                'text' => 'Generate a title',
                $option => 'client-value',
            ]));

            $response = $controller($request);

            self::assertSame(400, $response->getStatusCode());
            /** @var array{error: string} $body */
            $body = json_decode((string)$response->getContent(), true);
            self::assertStringContainsString($option, $body['error']);
        }

        $request = Request::create('/_ux/quill/ai-assistant', 'POST', server: ['CONTENT_TYPE' => 'application/json'], content: (string)json_encode([
            'feature' => 'generate',
            'text' => 'Generate a title',
            'options' => ['model' => 'client-model'],
        ]));

        $response = $controller($request);

        self::assertSame(400, $response->getStatusCode());
    }
}
