<?php

namespace Ehyiah\QuillJsBundle\Service;

use InvalidArgumentException;

/**
 * Builds OpenAI-format messages for each AI Assistant feature.
 */
final class AiAssistantPromptBuilder
{
    /**
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    public function build(string $feature, string $text, array $payload): array
    {
        return match ($feature) {
            'translate' => $this->buildTranslateMessages($text, $payload),
            'rewrite' => $this->buildRewriteMessages($text, $payload),
            'grammar' => $this->buildGrammarMessages($text),
            'generate' => $this->buildGenerateMessages($text),
            'summarize' => $this->buildSummarizeMessages($text, $payload),
            'synonym' => $this->buildSynonymMessages($text, $payload),
            default => throw new InvalidArgumentException(sprintf('Unknown feature "%s".', $feature)),
        };
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
            ['role' => 'user', 'content' => sprintf("Translate the following text to %s. Detect the source language automatically:\n%s", $targetLang, $text)],
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

    /** @return array<int, array{role: string, content: string}> */
    private function buildGrammarMessages(string $text): array
    {
        return [
            ['role' => 'system', 'content' => 'You are a grammar expert. Correct all grammatical errors in the user\'s text. Preserve the original meaning and style. Respond with ONLY the corrected text, no explanations.'],
            ['role' => 'user', 'content' => sprintf("Correct the grammatical errors in the following text. Detect the language and preserve it:\n%s", $text)],
        ];
    }

    /** @return array<int, array{role: string, content: string}> */
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
     * @param array<string, mixed> $payload
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function buildSynonymMessages(string $text, array $payload): array
    {
        $count = $payload['count'] ?? 5;
        if (!is_int($count) || $count < 1 || $count > 20) {
            $count = 5;
        }

        return [
            ['role' => 'system', 'content' => 'You are a lexicography assistant. Respond ONLY with a valid JSON array of synonym objects in format [{"word": "...", "score": 0.0-1.0}]. Sort by relevance (highest score first). No explanations, no notes.'],
            ['role' => 'user', 'content' => sprintf('Find up to %d synonyms for the word "%s". Detect the language automatically. Respond only with the JSON array.', $count, $text)],
        ];
    }
}
