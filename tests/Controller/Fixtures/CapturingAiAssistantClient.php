<?php

namespace Ehyiah\QuillJsBundle\Tests\Controller\Fixtures;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;
use Ehyiah\QuillJsBundle\Service\AiAssistantClientInterface;

/**
 * @phpstan-type MessagesType array<int, array{role: string, content: string}>
 */
final class CapturingAiAssistantClient implements AiAssistantClientInterface
{
    /**
     * @var array{config: AiAssistantConfig, messages: MessagesType}|null
     */
    public ?array $captured = null;

    /**
     * @param array<int, array{role: string, content: string}> $messages
     *
     * @return array{result: string, usage: array<string, float|int>|null}
     */
    public function complete(AiAssistantConfig $config, array $messages): array
    {
        $this->captured = [
            'config' => $config,
            'messages' => $messages,
        ];

        return [
            'result' => 'Generated title',
            'usage' => ['total_tokens' => 7],
        ];
    }
}
