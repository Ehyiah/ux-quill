<?php

namespace Ehyiah\QuillJsBundle\Controller;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use InvalidArgumentException;
use RuntimeException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class AiAssistantController
{
    private const FEATURES = ['rewrite', 'translate', 'grammar', 'generate', 'summarize'];

    public function __construct(
        private readonly AiAssistantConfig $config,
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

        $options = $payload['options'] ?? [];
        if (!is_array($options)) {
            $options = [];
        }

        $model = $payload['model'] ?? null;
        if (is_string($model) && '' !== $model) {
            $options['model'] = $model;
        }

        $cfg = $this->config->withOptions($options);

        try {
            $messages = $this->buildMessages($feature, $text, $payload);
            $apiResult = $this->callApi($cfg, $messages);
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage());
        }

        $response = ['result' => $apiResult['result']];
        if (null !== $apiResult['usage']) {
            $response['usage'] = $apiResult['usage'];
        }

        return new JsonResponse($response);
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildMessages(string $feature, string $text, array $payload): array
    {
        $messages = match ($feature) {
            'translate' => $this->buildTranslateMessages($text, $payload),
            'rewrite' => $this->buildRewriteMessages($text, $payload),
            'grammar' => $this->buildGrammarMessages($text),
            'generate' => $this->buildGenerateMessages($text),
            'summarize' => $this->buildSummarizeMessages($text, $payload),
            default => throw new InvalidArgumentException(sprintf('Unknown feature "%s".', $feature)),
        };

        $reasoning = $payload['reasoning'] ?? true;
        if (!$reasoning && isset($messages[0]) && 'system' === $messages[0]['role']) {
            $messages[0]['content'] .= ' Do not show any reasoning, thinking, or chain-of-thought. Respond directly with only the final answer.';
        }

        return $messages;
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildTranslateMessages(string $text, array $payload): array
    {
        $targetLang = $payload['targetLang'] ?? 'en';

        return [
            ['role' => 'system', 'content' => 'You are a professional translator. Translate the user\'s text accurately. Respond with ONLY the translation, no explanations or notes.'],
            ['role' => 'user', 'content' => sprintf("Translate this from English to %s:\n%s", $targetLang, $text)],
        ];
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildRewriteMessages(string $text, array $payload): array
    {
        $style = $payload['style'] ?? 'formal';
        $styleDesc = match ($style) {
            'formal' => 'a formal and professional tone',
            'casual' => 'a casual and friendly tone',
            'concise' => 'be short and concise',
            'expanded' => 'be more detailed and expanded',
            default => 'improved clarity and flow',
        };

        return [
            ['role' => 'system', 'content' => 'You are a professional editor. Improve the user\'s text. Respond with ONLY the rewritten text, no explanations.'],
            ['role' => 'user', 'content' => sprintf("Rewrite this text with %s:\n%s", $styleDesc, $text)],
        ];
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function buildGrammarMessages(string $text): array
    {
        return [
            ['role' => 'system', 'content' => 'You are a grammar expert. Correct all grammatical errors in the user\'s text. Preserve the original meaning and style. Respond with ONLY the corrected text, no explanations.'],
            ['role' => 'user', 'content' => sprintf("Correct the grammatical errors in this text:\n%s", $text)],
        ];
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    private function buildGenerateMessages(string $text): array
    {
        return [
            ['role' => 'system', 'content' => 'You are a content generator. Fulfill the user\'s request directly. Respond with ONLY the generated content, no explanations, no options, no greetings, no notes.'],
            ['role' => 'user', 'content' => $text],
        ];
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildSummarizeMessages(string $text, array $payload): array
    {
        $format = $payload['format'] ?? 'paragraph';
        $formatInst = 'bullets' === $format ? 'bullet points' : 'a coherent paragraph';

        return [
            ['role' => 'system', 'content' => 'You are a professional summarizer. Summarize the key points concisely and accurately.'],
            ['role' => 'user', 'content' => sprintf("Summarize this text as %s:\n%s", $formatInst, $text)],
        ];
    }

    /**
     * @param array<int, array{role: string, content: string}> $messages
     *
     * @return array{result: string, usage: array<string, int>|null}
     */
    private function callApi(AiAssistantConfig $config, array $messages): array
    {
        $headers = [
            'Content-Type: application/json',
        ];

        if (null !== $config->apiKey && '' !== $config->apiKey) {
            $headers[] = 'Authorization: Bearer ' . $config->apiKey;
        }

        $payload = json_encode([
            'model' => $config->model,
            'messages' => $messages,
            'max_tokens' => $config->maxTokens,
            'temperature' => $config->temperature,
        ], JSON_THROW_ON_ERROR);

        $ch = curl_init($config->apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $config->timeout,
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if (false === $body || $httpCode >= 400) {
            throw new RuntimeException(sprintf('API error (HTTP %d): %s', $httpCode, $error ?: ($body ?: 'Unknown error')));
        }

        if (!is_string($body)) {
            throw new RuntimeException('API returned non-string response.');
        }

        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

        $result = trim($data['choices'][0]['message']['content'] ?? '');
        $usage = $data['usage'] ?? null;

        return ['result' => $result, 'usage' => $usage];
    }

    private function error(string $message): JsonResponse
    {
        return new JsonResponse(['error' => $message], 400);
    }
}
