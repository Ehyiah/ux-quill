<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\DummySynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderRegistry;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderRegistry
 */
final class SynonymProviderRegistryTest extends TestCase
{
    /**
     * @covers ::__construct
     * @covers ::has
     * @covers ::get
     */
    public function testGetRegisteredProvider(): void
    {
        $dummy = new DummySynonymProvider();
        $registry = new SynonymProviderRegistry([$dummy]);

        $this->assertTrue($registry->has(DummySynonymProvider::class));
        $this->assertSame($dummy, $registry->get(DummySynonymProvider::class));
    }

    /**
     * @covers ::has
     */
    public function testHasReturnsFalseForUnknownProvider(): void
    {
        $registry = new SynonymProviderRegistry([]);

        $this->assertFalse($registry->has('Unknown\Provider'));
    }

    /**
     * @covers ::get
     */
    public function testGetThrowsForUnknownProvider(): void
    {
        $registry = new SynonymProviderRegistry([]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Unknown synonym provider');

        $registry->get('Unknown\Provider');
    }

    /**
     * @covers ::get
     */
    public function testGetReturnsSynonymsFromProvider(): void
    {
        $provider = new DummySynonymProvider();
        $registry = new SynonymProviderRegistry([$provider]);

        $synonyms = $registry->get(DummySynonymProvider::class)->getSynonyms('important');

        $this->assertContainsOnlyInstancesOf(Synonym::class, $synonyms);
        $this->assertCount(2, $synonyms);
        $this->assertSame('essentiel', $synonyms[0]->word);
        $this->assertSame('crucial', $synonyms[1]->word);
    }
}
