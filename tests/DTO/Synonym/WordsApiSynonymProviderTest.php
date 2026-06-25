<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Synonym;

use Ehyiah\QuillJsBundle\DTO\Synonym\Config\WordsApiSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use Ehyiah\QuillJsBundle\DTO\Synonym\WordsApiSynonymProvider;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Synonym\WordsApiSynonymProvider
 */
final class WordsApiSynonymProviderTest extends TestCase
{
    public function testImplementsInterface(): void
    {
        $provider = new WordsApiSynonymProvider(new WordsApiSynonymConfig(apiKey: 'test-key'));

        $this->assertInstanceOf(SynonymProviderInterface::class, $provider);
    }

    public function testValidatePassesWithKey(): void
    {
        $provider = new WordsApiSynonymProvider(new WordsApiSynonymConfig(apiKey: 'valid-key'));

        $provider->validate();

        $this->expectNotToPerformAssertions();
    }

    public function testValidateThrowsWithEmptyKey(): void
    {
        $provider = new WordsApiSynonymProvider(new WordsApiSynonymConfig(apiKey: ''));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }

    public function testValidateThrowsWithNullKey(): void
    {
        $provider = new WordsApiSynonymProvider(new WordsApiSynonymConfig());

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('API key');

        $provider->validate();
    }
}
