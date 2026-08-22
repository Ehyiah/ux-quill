<?php

namespace Ehyiah\QuillJsBundle\Service;

use Ehyiah\QuillJsBundle\DTO\Modules\Config\AiAssistantConfig;

interface AiAssistantClientInterface
{
    /**
     * @param array<int, array{role: string, content: string}> $messages
     *
     * @return array{result: string, usage: array<string, float|int>|null}
     */
    public function complete(AiAssistantConfig $config, array $messages): array;
}
