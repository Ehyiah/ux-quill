<?php

namespace Ehyiah\QuillJsBundle\Tests\Service;

use Ehyiah\QuillJsBundle\Service\AiAssistantPromptBuilder;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Service\AiAssistantPromptBuilder
 */
final class AiAssistantPromptBuilderTest extends TestCase
{
    private AiAssistantPromptBuilder $builder;

    protected function setUp(): void
    {
        $this->builder = new AiAssistantPromptBuilder();
    }

    /**
     * @covers ::build
     */
    public function testTranslateUsesTargetLanguageAndDefaultsToEnglish(): void
    {
        $messages = $this->builder->build('translate', 'Bonjour', ['targetLang' => 'fr']);

        self::assertSame('system', $messages[0]['role']);
        self::assertStringContainsString('professional translator', $messages[0]['content']);
        self::assertSame('user', $messages[1]['role']);
        self::assertStringContainsString('Translate the following text to fr.', $messages[1]['content']);
        self::assertStringContainsString('Bonjour', $messages[1]['content']);

        $default = $this->builder->build('translate', 'Hello', []);
        self::assertStringContainsString('Translate the following text to en.', $default[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testRewriteMapsKnownStylesAndFallsBackForUnknownOnes(): void
    {
        $expected = [
            'formal' => 'a formal and professional tone',
            'casual' => 'a casual and friendly tone',
            'concise' => 'be short and concise',
            'expanded' => 'be more detailed and expanded',
        ];

        foreach ($expected as $style => $description) {
            $messages = $this->builder->build('rewrite', 'Some text', ['style' => $style]);
            self::assertStringContainsString(sprintf('Rewrite this text with %s:', $description), $messages[1]['content']);
        }

        $fallback = $this->builder->build('rewrite', 'Some text', ['style' => 'unknown-style']);
        self::assertStringContainsString('Rewrite this text with improved clarity and flow:', $fallback[1]['content']);

        $defaultStyle = $this->builder->build('rewrite', 'Some text', []);
        self::assertStringContainsString('a formal and professional tone', $defaultStyle[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testGrammarWrapsTextWithCorrectionInstructions(): void
    {
        $messages = $this->builder->build('grammar', 'She go to school', []);

        self::assertStringContainsString('grammar expert', $messages[0]['content']);
        self::assertStringContainsString('She go to school', $messages[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testGenerateSendsPromptAsUserMessage(): void
    {
        $messages = $this->builder->build('generate', 'Write a haiku', []);

        self::assertStringContainsString('content generator', $messages[0]['content']);
        self::assertSame('Write a haiku', $messages[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testSummarizeSupportsParagraphAndBulletsFormats(): void
    {
        $paragraph = $this->builder->build('summarize', 'Long content', ['format' => 'paragraph']);
        self::assertStringContainsString('as a coherent paragraph:', $paragraph[1]['content']);

        $bullets = $this->builder->build('summarize', 'Long content', ['format' => 'bullets']);
        self::assertStringContainsString('as bullet points:', $bullets[1]['content']);

        $default = $this->builder->build('summarize', 'Long content', []);
        self::assertStringContainsString('as a coherent paragraph:', $default[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testSynonymClampsCountToValidRange(): void
    {
        $clampedHigh = $this->builder->build('synonym', 'happy', ['count' => 25]);
        self::assertStringContainsString('up to 5 synonyms', $clampedHigh[1]['content']);

        $valid = $this->builder->build('synonym', 'happy', ['count' => 3]);
        self::assertStringContainsString('up to 3 synonyms', $valid[1]['content']);

        $invalidType = $this->builder->build('synonym', 'happy', ['count' => 'many']);
        self::assertStringContainsString('up to 5 synonyms', $invalidType[1]['content']);

        $tooLow = $this->builder->build('synonym', 'happy', ['count' => 0]);
        self::assertStringContainsString('up to 5 synonyms', $tooLow[1]['content']);
    }

    /**
     * @covers ::build
     */
    public function testUnknownFeatureThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown feature "magic"');

        $this->builder->build('magic', 'text', []);
    }
}
