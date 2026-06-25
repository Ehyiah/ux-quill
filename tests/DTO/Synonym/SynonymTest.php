<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\Synonym
 */
final class SynonymTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testDefaultScore(): void
    {
        $synonym = new Synonym(word: 'essentiel');

        $this->assertSame('essentiel', $synonym->word);
        $this->assertSame(1.0, $synonym->score);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomScore(): void
    {
        $synonym = new Synonym(word: 'crucial', score: 0.85);

        $this->assertSame('crucial', $synonym->word);
        $this->assertSame(0.85, $synonym->score);
    }

    /**
     * @covers ::__construct
     */
    public function testWordProperty(): void
    {
        $synonym = new Synonym(word: 'important', score: 0.5);

        $this->assertSame('important', $synonym->word);
        $this->assertSame(0.5, $synonym->score);
    }
}
