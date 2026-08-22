<?php

namespace Ehyiah\QuillJsBundle\Controller;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use Ehyiah\QuillJsBundle\Service\AiAssistantClientInterface;
use Ehyiah\QuillJsBundle\Service\AiAssistantPromptBuilder;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class AiAssistantController
{
    private const FEATURES = ['rewrite', 'translate', 'grammar', 'generate', 'summarize', 'synonym'];

    public function __construct(
        private readonly AiAssistantConfig $config,
        private readonly AiAssistantPromptBuilder $promptBuilder,
        private readonly ?AiAssistantClientInterface $client = null,
    ) {
    }

    #[Route('/_ux/quill/ai-assistant', name: 'ux_quill_ai_assistant', methods: ['POST'])]
    public function __invoke(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        if (!is_array($payload)) {
            return $this->error('Invalid JSON payload.');
        }

        $feature = $payload['feature'] ?? null;
        $text = $payload['text'] ?? null;

        if (!is_string($feature) || '' === $feature) {
            return $this->error('Missing or invalid "feature".');
        }

        if (!in_array($feature, self::FEATURES, true)) {
            return $this->error(sprintf('Unknown feature "%s".', $feature));
        }

        if (!is_string($text) || '' === $text) {
            return $this->error('Missing or invalid "text".');
        }

        if (mb_strlen($text) > $this->config->maxTextChars) {
            return $this->error(sprintf(
                'The submitted text is too long (%d characters). Maximum allowed: %d.',
                mb_strlen($text),
                $this->config->maxTextChars,
            ));
        }

        if (array_key_exists('options', $payload)) {
            return $this->error('The "options" object is managed by the server and cannot be sent in the request.');
        }

        foreach (['api_url', 'model', 'max_tokens', 'temperature', 'timeout', 'reasoning'] as $option) {
            if (array_key_exists($option, $payload)) {
                return $this->error(sprintf('The "%s" option is managed by the server and cannot be overridden from the request.', $option));
            }
        }

        try {
            if (null === $this->client) {
                throw new RuntimeException('The AI Assistant API provider requires symfony/http-client. Install it with: composer require symfony/http-client');
            }

            $apiResult = $this->client->complete($this->config, $this->promptBuilder->build($feature, $text, $payload));
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        $response = ['result' => $apiResult['result']];
        if (null !== $apiResult['usage']) {
            $response['usage'] = $apiResult['usage'];
        }

        return new JsonResponse($response);
    }

    private function error(string $message): JsonResponse
    {
        return new JsonResponse(['error' => $message], 400);
    }
}
